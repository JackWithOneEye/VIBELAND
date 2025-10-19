// VIBELAND Monophonic Synthesizer
// Uses Web Audio API with a single voice: Osc -> Filter -> Amp -> Delay (Dry+Wet) -> Panner -> Master -> Destination
// Features: last-note priority, optional legato, ADSR, filter with env routing, delay with warmth, LFOs, waveform selector, octave shift, master volume.
// UI: two-octave piano and circular knobs (no external dependencies).

(() => {
  // Utility helpers
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dbToGain = (db) => Math.pow(10, db / 20);
  const normToGain = (u, minDb = -60) => {
    if (u <= 0) return 0; // allow true mute
    const db = lerp(minDb, 0, clamp(u, 0, 1));
    return dbToGain(db);
  };
  const normToFreq = (u, fmin, fmax) => {
    const t = clamp(u, 0, 1);
    return fmin * Math.pow(fmax / fmin, t);
  };
  const freqToNorm = (f, fmin, fmax) => {
    const fClamped = clamp(f, fmin, fmax);
    return Math.log(fClamped / fmin) / Math.log(fmax / fmin);
  };

  // MIDI utilities
  const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Safe parameter scheduling utility
  const smoothSetTarget = (param, value, now, tau = 0.01) => {
    if (param.cancelAndHoldAtTime) {
      param.cancelAndHoldAtTime(now);
    } else {
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
    }
    param.setTargetAtTime(value, now, tau);
  };

  // LFO (Low Frequency Oscillator) class
  class LFO {
    constructor(ctx, { type = 'sine', freq = 5 } = {}) {
      this.ctx = ctx;

      // Main oscillator
      this.osc = ctx.createOscillator();
      this.osc.type = type;
      this.osc.frequency.value = freq;

      // Bipolar output: -1..+1
      this.bipOut = ctx.createGain();
      this.bipOut.gain.value = 1;

      // Unipolar output: 0..1 = (bip * 0.5) + 0.5
      this.uniScale = ctx.createGain();
      this.uniScale.gain.value = 0.5;

      this.uniSum = ctx.createGain(); // sums uniScale and uniOffset
      this.uniOffset = ctx.createConstantSource();
      this.uniOffset.offset.value = 0.5;
      this.uniOffset.start();

      // Wiring
      this.osc.connect(this.bipOut);
      this.osc.connect(this.uniScale);
      this.uniScale.connect(this.uniSum);
      this.uniOffset.connect(this.uniSum);

      this.unipolar = false; // default bipolar
      this.osc.start();
    }

    setWaveform(type) {
      this.osc.type = type;
    }

    setFrequency(hz) {
      const now = this.ctx.currentTime;
      const f = clamp(hz, 0.1, 20);
      smoothSetTarget(this.osc.frequency, f, now);
    }

    setUnipolar(on) {
      this.unipolar = !!on;
    }

    // Returns an AudioNode producing the current-mode signal
    outputNode() {
      return this.unipolar ? this.uniSum : this.bipOut;
    }

    // Recreate osc to phase-align on sync with smooth transition
    sync(atTime = this.ctx.currentTime + 0.02) {
      const oldOsc = this.osc;
      const type = oldOsc.type;
      const freq = oldOsc.frequency.value;

      // Brief mute to prevent transient doubling
      const t = atTime;
      this.bipOut.gain.setValueAtTime(0, t);
      this.uniScale.gain.setValueAtTime(0, t);

      const newOsc = this.ctx.createOscillator();
      newOsc.type = type;
      newOsc.frequency.value = freq;

      newOsc.connect(this.bipOut);
      newOsc.connect(this.uniScale);

      newOsc.start(t);
      oldOsc.stop(t + 0.01);
      this.osc = newOsc;

      // Restore gains after sync
      this.bipOut.gain.linearRampToValueAtTime(1, t + 0.01);
      this.uniScale.gain.linearRampToValueAtTime(0.5, t + 0.01);
    }
  }

  // Single-voice monophonic synth engine
  class MonoSynth {
    constructor(ctx) {
      this.ctx = ctx;

      // Master gain
      this.master = ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(ctx.destination);

      // Stereo panner
      this.panner = ctx.createStereoPanner();
      this.panner.pan.value = 0;

      // Amp (VCA) gain with ADSR
      this.amp = ctx.createGain();
      this.amp.gain.value = 0.0001; // > 0 to avoid denormals/clicks

      // Delay effect (inserted after amp, before panner)
      this.dryGain = ctx.createGain();
      this.dryGain.gain.value = 0.75;
      this.wetGain = ctx.createGain();
      this.wetGain.gain.value = 0.25;

      this.delayIn = ctx.createGain();
      this.delay = ctx.createDelay(2.5);
      this.delay.delayTime.value = 0.35;

      // Warmth: low-pass filter in feedback loop
      this.fbTone = ctx.createBiquadFilter();
      this.fbTone.type = "lowpass";
      this.fbTone.frequency.value = 6500;
      this.fbTone.Q.value = 0.2;

      this.fbGain = ctx.createGain();
      this.fbGain.gain.value = 0.35;

      // Filter
      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 829;
      this.filter.Q.value = 0.5;

      // Filter envelope routing:
      // ConstantSource(offset = amount in Hz) -> [Gain scheduled with ADSR shape 0..1] -> filter.frequency
      this.filterEnvAmount = ctx.createConstantSource();
      this.filterEnvAmount.offset.value = 0; // set via knob
      this.filterEnvAmount.start();

      this.filterEnvShape = ctx.createGain(); // envelope shape 0..1
      this.filterEnvShape.gain.value = 0;

      this.filterEnvAmount.connect(this.filterEnvShape);
      this.filterEnvShape.connect(this.filter.frequency);

      // Oscillator (always running)
      this.osc = ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.value = midiToFreq(60); // C4 by default
      this.osc.detune.value = 0; // base detune in cents
      this.osc.start();

      // Wire path: Osc -> Filter -> Amp -> (Dry + Delay) -> Panner -> Master
      this.osc.connect(this.filter);
      this.filter.connect(this.amp);

      // Split into dry and wet paths
      this.amp.connect(this.dryGain);
      this.amp.connect(this.delayIn);

      // Delay feedback loop
      this.delayIn.connect(this.delay);
      this.delay.connect(this.fbTone);
      this.fbTone.connect(this.fbGain);
      this.fbGain.connect(this.delayIn);

      // Wet output
      this.delay.connect(this.wetGain);

      // Merge dry and wet
      this.dryGain.connect(this.panner);
      this.wetGain.connect(this.panner);
      this.panner.connect(this.master);

      // Envelope params (seconds and 0..1)
      this.attack = 0.02;
      this.decay = 0.10;
      this.sustain = 0.70;
      this.release = 0.20;

      // LFOs
      this.lfo1 = new LFO(ctx, { type: 'sine', freq: 5 });
      this.lfo2 = new LFO(ctx, { type: 'sine', freq: 5 });

      // LFO modulation routing scalers  
      this.filterLfoScale = ctx.createGain();
      this.filterLfoScale.gain.value = 0;
      this.filterLfoScale.connect(this.filter.detune);

      this.detuneLfoScale = ctx.createGain();
      this.detuneLfoScale.gain.value = 0;
      this.detuneLfoScale.connect(this.osc.detune);

      this.panLfoScale = ctx.createGain();
      this.panLfoScale.gain.value = 0;
      this.panLfoScale.connect(this.panner.pan);

      // LFO routing state
      this.filterLfoSource = 'off'; // 'off' | 'lfo1' | 'lfo2'
      this.detuneLfoSource = 'off';
      this.panLfoSource = 'off';

      // State
      this.currentNote = null;   // MIDI number of active note (if any)
      this.legato = false;       // legato mode toggle
      this.glideTime = 0.008;    // short time constant for setTargetAtTime smoothing (avoid clicks)
    }

    setWaveform(type) { this.osc.type = type; }

    setMasterGain(u) {
      const now = this.ctx.currentTime;
      const floor = 1e-5; // for exponential scheduling safety
      const g = normToGain(u, -60);

      const p = this.master.gain;
      p.cancelScheduledValues(now);

      if (g <= 0) {
        // ramp to floor then hard mute
        const current = Math.max(floor, p.value || floor);
        p.setValueAtTime(current, now);
        p.exponentialRampToValueAtTime(floor, now + 0.02);
        p.setValueAtTime(0.0, now + 0.021);
      } else {
        const start = Math.max(floor, p.value || floor);
        p.setValueAtTime(start, now);
        p.exponentialRampToValueAtTime(g, now + 0.02);
      }
    }

    setFilterCutoff(u) {
      const now = this.ctx.currentTime;
      const fmin = 30;
      const nyquist = this.ctx.sampleRate / 2;
      const fmax = Math.min(14000, nyquist - 100); // margin from Nyquist
      const targetHz = normToFreq(u, fmin, fmax);

      const p = this.filter.frequency;
      p.cancelScheduledValues(now);

      // exponential ramps sound natural for frequency
      const floor = 1; // cannot ramp to 0
      const start = Math.max(floor, p.value || floor);
      p.setValueAtTime(start, now);
      p.exponentialRampToValueAtTime(targetHz, now + 0.02);
    }

    setFilterQ(q) {
      const now = this.ctx.currentTime;
      this.filter.Q.setTargetAtTime(clamp(q, 0.0001, 30), now, 0.01);
    }

    setFilterType(type) { this.filter.type = type; }

    // Filter gain (dB) control for shelf/peaking types, tapered like master (0..1 → -60..0 dB)
    setFilterGainFromNorm(u) {
      const now = this.ctx.currentTime;
      const db = lerp(-60, 0, clamp(u, 0, 1));
      smoothSetTarget(this.filter.gain, db, now);
    }

    setFilterEnvAmount(amountHz) {
      const now = this.ctx.currentTime;
      this.filterEnvAmount.offset.setTargetAtTime(amountHz, now, 0.01);
    }

    // Delay controls
    setDelayLevel(u) {
      const now = this.ctx.currentTime;
      const dry = 1 - clamp(u, 0, 1);
      const wet = clamp(u, 0, 1);
      smoothSetTarget(this.dryGain.gain, dry, now, 0.01);
      smoothSetTarget(this.wetGain.gain, wet, now, 0.01);
    }

    setDelayTime(seconds) {
      const now = this.ctx.currentTime;
      const t = clamp(seconds, 0.05, 2.0);
      smoothSetTarget(this.delay.delayTime, t, now, 0.01);
    }

    setDelayFeedback(u) {
      const now = this.ctx.currentTime;
      const f = clamp(u, 0, 0.9);
      smoothSetTarget(this.fbGain.gain, f, now, 0.01);
    }

    setADSR(a, d, s, r) {
      this.attack = Math.max(0.001, a);
      this.decay = Math.max(0.001, d);
      this.sustain = clamp(s, 0, 1);
      this.release = Math.max(0.001, r);
    }

    setLegato(on) { this.legato = !!on; }

    // Oscillator detune control
    setDetuneBase(cents) {
      const now = this.ctx.currentTime;
      this.osc.detune.setTargetAtTime(clamp(cents, -1200, 1200), now, 0.01);
    }

    // LFO control methods
    setLfoParams(index, { type, freq, unipolar }) {
      const lfo = index === 1 ? this.lfo1 : this.lfo2;
      if (type) lfo.setWaveform(type);
      if (freq != null) lfo.setFrequency(freq);
      if (unipolar != null) {
        lfo.setUnipolar(unipolar);
        // Update routing to reflect new polarity
        this._updateRoutingForLfo(index);
      }
    }

    syncLFOs() {
      const t = this.ctx.currentTime + 0.02;
      this.lfo1.sync(t);
      this.lfo2.sync(t);
    }

    // LFO modulation routing
    setFilterLfoAmount(cents) {
      const now = this.ctx.currentTime;
      smoothSetTarget(this.filterLfoScale.gain, clamp(cents, -2400, 2400), now);
    }

    setFilterLfoSource(src) {
      this.filterLfoSource = src;
      this._updateFilterLfoRouting();
    }

    setDetuneLfoAmount(cents) {
      const now = this.ctx.currentTime;
      smoothSetTarget(this.detuneLfoScale.gain, clamp(cents, -100, 100), now);
    }

    setDetuneLfoSource(src) {
      this.detuneLfoSource = src;
      this._updateDetuneLfoRouting();
    }

    setPanLfoAmount(amount) {
      const now = this.ctx.currentTime;
      smoothSetTarget(this.panLfoScale.gain, clamp(amount, 0, 1), now);
    }

    setPanLfoSource(src) {
      this.panLfoSource = src;
      this._updatePanLfoRouting();
    }

    // Helper to get pan source node (always use bipolar for centered panning)
    _getPanSourceNode(lfo) {
      return lfo.bipOut; // Always use bipolar for pan to keep centered motion
    }

    // Internal routing helpers
    _updateRoutingForLfo(index) {
      if ((this.filterLfoSource === 'lfo1' && index === 1) ||
        (this.filterLfoSource === 'lfo2' && index === 2)) {
        this._updateFilterLfoRouting();
      }
      if ((this.detuneLfoSource === 'lfo1' && index === 1) ||
        (this.detuneLfoSource === 'lfo2' && index === 2)) {
        this._updateDetuneLfoRouting();
      }
      if ((this.panLfoSource === 'lfo1' && index === 1) ||
        (this.panLfoSource === 'lfo2' && index === 2)) {
        this._updatePanLfoRouting();
      }
    }

    // Helper to safely disconnect all inputs to a node
    _disconnectInput(node) {
      try {
        this.lfo1.outputNode().disconnect(node);
        this.lfo1.bipOut.disconnect(node);
      } catch (e) { }
      try {
        this.lfo2.outputNode().disconnect(node);
        this.lfo2.bipOut.disconnect(node);
      } catch (e) { }
    }

    _updateFilterLfoRouting() {
      this._disconnectInput(this.filterLfoScale);

      if (this.filterLfoSource === 'lfo1') {
        this.lfo1.outputNode().connect(this.filterLfoScale);
      } else if (this.filterLfoSource === 'lfo2') {
        this.lfo2.outputNode().connect(this.filterLfoScale);
      }
    }

    _updateDetuneLfoRouting() {
      this._disconnectInput(this.detuneLfoScale);

      if (this.detuneLfoSource === 'lfo1') {
        this.lfo1.outputNode().connect(this.detuneLfoScale);
      } else if (this.detuneLfoSource === 'lfo2') {
        this.lfo2.outputNode().connect(this.detuneLfoScale);
      }
    }

    _updatePanLfoRouting() {
      this._disconnectInput(this.panLfoScale);

      if (this.panLfoSource === 'lfo1') {
        this._getPanSourceNode(this.lfo1).connect(this.panLfoScale);
      } else if (this.panLfoSource === 'lfo2') {
        this._getPanSourceNode(this.lfo2).connect(this.panLfoScale);
      }
    }

    // Note on: retriggers ADSR unless legato is enabled and a note is already held
    noteOn(midi) {
      const now = this.ctx.currentTime;
      const freq = midiToFreq(midi);

      if (this.currentNote !== null && this.legato) {
        // Legato: only glide pitch, keep envelope phase
        this.osc.frequency.setTargetAtTime(freq, now, this.glideTime);
        this.currentNote = midi;
        return;
      }

      this.currentNote = midi;
      // Small smoothing to avoid discontinuities
      this.osc.frequency.setTargetAtTime(freq, now, this.glideTime);

      // Amplitude ADSR
      const g = this.amp.gain;
      g.cancelScheduledValues(now);
      // Anchor from the current value (safe even if mid-release)
      const startVal = Math.max(0.0001, g.value);
      g.setValueAtTime(startVal, now);
      g.linearRampToValueAtTime(1.0, now + this.attack);
      g.linearRampToValueAtTime(this.sustain, now + this.attack + this.decay);

      // Filter envelope shape 0..1 (reuse ADSR shape)
      const e = this.filterEnvShape.gain;
      e.cancelScheduledValues(now);
      e.setValueAtTime(0.0, now);
      e.linearRampToValueAtTime(1.0, now + this.attack);
      e.linearRampToValueAtTime(this.sustain, now + this.attack + this.decay);
    }

    // Note off: release stage
    noteOff() {
      const now = this.ctx.currentTime;
      if (this.currentNote === null) return;

      // Amplitude release
      const g = this.amp.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(Math.max(0.0001, g.value), now);
      g.linearRampToValueAtTime(0.0001, now + this.release);

      // Filter env release
      const e = this.filterEnvShape.gain;
      e.cancelScheduledValues(now);
      e.setValueAtTime(e.value, now);
      e.linearRampToValueAtTime(0.0, now + this.release);

      this.currentNote = null;
    }
  }

  // Selector knob component (for discrete options like waveform/filter type)
  class SelectorKnob {
    constructor(el, onChange) {
      this.el = el;
      this.ind = el.querySelector('.indicator');
      this.textEl = el.querySelector('.selector-text');

      this.options = el.dataset.options.split(',');
      this.currentIndex = parseInt(el.dataset.value) || 0;

      this.onChange = onChange;
      this.dragging = false;
      this.startY = 0;
      this.startIndex = 0;

      this.attachEvents();
      this.updateVisual();
    }

    attachEvents() {
      // Mouse events
      this.el.addEventListener('mousedown', this.onStart.bind(this));
      this.el.addEventListener('dblclick', this.onReset.bind(this));

      // Prevent context menu
      this.el.addEventListener('contextmenu', e => e.preventDefault());

      // Global mouse events
      document.addEventListener('mousemove', this.onMove.bind(this));
      document.addEventListener('mouseup', this.onEnd.bind(this));

      // Touch events
      this.el.addEventListener('touchstart', this.onStart.bind(this));
      document.addEventListener('touchmove', this.onMove.bind(this));
      document.addEventListener('touchend', this.onEnd.bind(this));
    }

    onStart(e) {
      e.preventDefault();
      this.dragging = true;
      this.startY = e.clientY || (e.touches && e.touches[0].clientY);
      this.startIndex = this.currentIndex;
      this.el.style.cursor = 'ns-resize';
      document.body.style.cursor = 'ns-resize';
    }

    onMove(e) {
      if (!this.dragging) return;
      e.preventDefault();

      const currentY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaY = this.startY - currentY; // inverted: up = increase

      // Sensitivity: pixels per option
      let sensitivity = 40;
      if (e.shiftKey) sensitivity *= 3; // fine control with Shift
      if (e.ctrlKey) sensitivity /= 3;  // coarse control with Ctrl

      const deltaOptions = deltaY / sensitivity;
      let newIndex = Math.round(this.startIndex + deltaOptions);

      // Clamp to valid range
      newIndex = clamp(newIndex, 0, this.options.length - 1);

      if (newIndex !== this.currentIndex) {
        this.currentIndex = newIndex;
        this.updateVisual();
        if (this.onChange) this.onChange(this.options[this.currentIndex]);
      }
    }

    onEnd() {
      if (this.dragging) {
        this.dragging = false;
        this.el.style.cursor = '';
        document.body.style.cursor = '';
      }
    }

    onReset() {
      const resetIndex = parseInt(this.el.dataset.value) || 0;
      if (this.currentIndex !== resetIndex) {
        this.currentIndex = resetIndex;
        this.updateVisual();
        if (this.onChange) this.onChange(this.options[this.currentIndex]);
      }
    }

    updateVisual() {
      const degrees = -135 + (this.currentIndex / Math.max(1, this.options.length - 1)) * 270;
      this.ind.style.transform = `translateX(-50%) rotate(${degrees}deg)`;

      // Only update text if textEl exists (not used for filter knob anymore)
      if (this.textEl) {
        this.textEl.textContent = this.options[this.currentIndex].toUpperCase();
      }

      // Update waveform icons if this is a waveform knob
      if (this.el.id === 'wave-knob' || this.el.id === 'lfo1-wave-knob' || this.el.id === 'lfo2-wave-knob') {
        const container = this.el.closest('.waveform-knob-container');
        if (container) {
          const icons = container.querySelectorAll('.waveform-icon');
          icons.forEach((icon, i) => {
            icon.classList.toggle('active', i === this.currentIndex);
          });
        }
      }


    }

    setValue(option) {
      const index = this.options.indexOf(option);
      if (index >= 0) {
        this.currentIndex = index;
        this.updateVisual();
      }
    }
  }

  // Simple circular knob component (pointer-driven)
  class Knob {
    constructor(el, onChange, format) {
      this.el = el;
      this.ind = document.createElement('div');
      this.ind.className = 'indicator';
      el.appendChild(this.ind);

      this.min = parseFloat(el.dataset.min);
      this.max = parseFloat(el.dataset.max);
      this.step = parseFloat(el.dataset.step);
      this.defaultVal = parseFloat(el.dataset.default);
      this.value = parseFloat(el.dataset.value);

      this.onChange = onChange;
      this.formatValue = format || (v => v.toString());

      this.dragging = false;
      this.startY = 0;
      this.startValue = 0;

      this.updateVisual();
      this.attachEvents();
    }

    // Update knob visual rotation based on current value
    updateVisual() {
      const norm = (this.value - this.min) / (this.max - this.min);
      const degrees = -135 + norm * 270; // -135 to +135 degrees
      this.ind.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
    }

    // Event handlers for mouse/touch interaction
    attachEvents() {
      this.el.addEventListener('mousedown', this.onStart.bind(this));
      this.el.addEventListener('dblclick', this.onReset.bind(this));

      // Prevent context menu on knobs
      this.el.addEventListener('contextmenu', e => e.preventDefault());

      // Global mouse events (for dragging outside the knob)
      document.addEventListener('mousemove', this.onMove.bind(this));
      document.addEventListener('mouseup', this.onEnd.bind(this));

      // Touch events
      this.el.addEventListener('touchstart', this.onStart.bind(this));
      document.addEventListener('touchmove', this.onMove.bind(this));
      document.addEventListener('touchend', this.onEnd.bind(this));
    }

    onStart(e) {
      e.preventDefault();
      // Ignore interactions when disabled
      if (this.el.classList.contains('disabled')) return;
      this.dragging = true;
      this.startY = e.clientY || (e.touches && e.touches[0].clientY);
      this.startValue = this.value;
      this.el.style.cursor = 'ns-resize';
      document.body.style.cursor = 'ns-resize';
    }

    onMove(e) {
      if (!this.dragging) return;
      e.preventDefault();

      const currentY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaY = this.startY - currentY; // inverted: up = increase

      // Sensitivity: pixels per full range
      let sensitivity = 200;
      if (e.shiftKey) sensitivity *= 5; // fine control with Shift
      if (e.ctrlKey) sensitivity /= 5;  // coarse control with Ctrl

      const range = this.max - this.min;
      const deltaValue = (deltaY / sensitivity) * range;

      let newValue = this.startValue + deltaValue;

      // Quantize to step
      if (this.step > 0) {
        newValue = Math.round(newValue / this.step) * this.step;
      }

      this.setValue(clamp(newValue, this.min, this.max));
    }

    onEnd() {
      if (this.dragging) {
        this.dragging = false;
        this.el.style.cursor = '';
        document.body.style.cursor = '';
      }
    }

    onReset() {
      if (this.el.classList.contains('disabled')) return;
      this.setValue(this.defaultVal);
    }

    setValue(val) {
      this.value = val;
      this.el.dataset.value = val;
      this.updateVisual();
      if (this.onChange) this.onChange(val);
    }
  }

  // Piano keyboard with last-note priority for monophonic play
  class PianoKeyboard {
    constructor(container, onNoteOn, onNoteOff) {
      this.container = container;
      this.onNoteOn = onNoteOn;
      this.onNoteOff = onNoteOff;

      // Last-note priority: track pressed keys
      this.heldKeys = new Set();
      this.keyStack = []; // order of key presses

      // Base octave (C4 = MIDI 60) + user octave shift
      this.baseOctave = 4;
      this.octaveShift = 0;

      this.buildKeyboard();
      this.attachEvents();
    }

    setOctaveShift(shift) {
      this.octaveShift = shift;
    }

    buildKeyboard() {
      // Keys are now static in HTML - just ensure pointer events are enabled and disable context menu
      const keys = this.container.querySelectorAll('.white-key, .black-key');
      keys.forEach(key => {
        key.style.pointerEvents = 'auto';
        key.addEventListener('contextmenu', e => e.preventDefault());
      });
    }

    attachEvents() {
      // Mouse events
      this.container.addEventListener('mousedown', this.onPointerDown.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));

      // Touch events
      this.container.addEventListener('touchstart', this.onPointerDown.bind(this));
      document.addEventListener('touchend', this.onPointerUp.bind(this));

      // Prevent default touch behavior
      this.container.addEventListener('touchmove', e => e.preventDefault());

      // Computer keyboard support (optional enhancement)
      this.attachKeyboardEvents();
    }

    attachKeyboardEvents() {
      // Map computer keys to piano keys (QWERTY layout)
      this.keyMap = {
        'KeyA': 0,  // C
        'KeyW': 1,  // C#
        'KeyS': 2,  // D
        'KeyE': 3,  // D#
        'KeyD': 4,  // E
        'KeyF': 5,  // F
        'KeyT': 6,  // F#
        'KeyG': 7,  // G
        'KeyY': 8,  // G#
        'KeyH': 9,  // A
        'KeyU': 10, // A#
        'KeyJ': 11, // B
        'KeyK': 12  // C (octave)
      };

      document.addEventListener('keydown', (e) => {
        if (e.repeat || !this.keyMap.hasOwnProperty(e.code)) return;
        e.preventDefault();
        this.triggerNote(this.keyMap[e.code], true);
      });

      document.addEventListener('keyup', (e) => {
        if (!this.keyMap.hasOwnProperty(e.code)) return;
        e.preventDefault();
        this.triggerNote(this.keyMap[e.code], false);
      });
    }

    onPointerDown(e) {
      e.preventDefault();
      e.stopPropagation();

      let key = e.target;

      // Walk up the DOM to find a key element
      while (key && key !== this.container) {
        if (key.classList && (key.classList.contains('white-key') || key.classList.contains('black-key'))) {
          break;
        }
        key = key.parentElement;
      }

      // If no key found, return
      if (!key || (!key.classList.contains('white-key') && !key.classList.contains('black-key'))) {
        console.log('No key found for click');
        return;
      }

      const semitone = parseInt(key.dataset.midi);
      console.log('Key pressed:', semitone, key.className);
      this.triggerNote(semitone, true);
    }

    onPointerUp(e) {
      // Release all held notes on pointer up (simpler for touch)
      if (this.keyStack.length > 0) {
        const currentNote = this.keyStack[this.keyStack.length - 1];
        this.triggerNote(currentNote, false);
      }
    }

    triggerNote(semitone, isOn) {
      const midiNote = (this.baseOctave + this.octaveShift) * 12 + semitone;

      if (isOn) {
        if (!this.heldKeys.has(semitone)) {
          this.heldKeys.add(semitone);
          this.keyStack.push(semitone);
          this.updateVisualState(semitone, true);
          this.onNoteOn(midiNote);
        }
      } else {
        if (this.heldKeys.has(semitone)) {
          this.heldKeys.delete(semitone);
          const idx = this.keyStack.indexOf(semitone);
          if (idx >= 0) this.keyStack.splice(idx, 1);
          this.updateVisualState(semitone, false);

          // Last-note priority: switch to most recent held key or release
          if (this.keyStack.length > 0) {
            const newNote = this.keyStack[this.keyStack.length - 1];
            const newMidi = (this.baseOctave + this.octaveShift) * 12 + newNote;
            this.onNoteOn(newMidi); // retrigger or legato depending on synth settings
          } else {
            this.onNoteOff();
          }
        }
      }
    }

    updateVisualState(semitone, active) {
      const keys = this.container.querySelectorAll(`[data-midi="${semitone}"]`);
      keys.forEach(key => {
        if (active) {
          key.classList.add('active');
        } else {
          key.classList.remove('active');
        }
      });
    }

    // Release all keys (useful for panic/reset)
    releaseAll() {
      this.heldKeys.forEach(semitone => {
        this.updateVisualState(semitone, false);
      });
      this.heldKeys.clear();
      this.keyStack.length = 0;
      this.onNoteOff();
    }
  }

  // Modern synthesizer application class
  class SynthesizerApp {
    constructor() {
      this.audioContext = null;
      this.synth = null;
      this.keyboard = null;
      this.knobs = {};
      this.isInitialized = false;
    }

    // Initialize audio context and synthesizer
    initAudio() {
      if (this.audioContext) return; // already initialized

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.synth = new MonoSynth(this.audioContext);

      // Expose synth for debugging
      window.synth = this.synth;

      // Resume audio context (required by modern browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      console.log('VIBELAND Synth initialized');
    }

    // Format knob values for display
    getFormatters() {
      return {
        octave: v => v.toString(),
        master: u => {
          if (u <= 0) return '-∞ dB';
          const db = lerp(-60, 0, u);
          return Math.round(db) + ' dB';
        },
        attack: v => v.toFixed(3) + 's',
        decay: v => v.toFixed(3) + 's',
        sustain: v => v.toFixed(2),
        release: v => v.toFixed(3) + 's',
        cutoff: u => {
          const ctx = this.audioContext || { sampleRate: 48000 }; // fallback before init
          const fmin = 30, fmax = Math.min(14000, (ctx.sampleRate / 2) - 100);
          return Math.round(normToFreq(u, fmin, fmax)) + ' Hz';
        },
        resonance: v => v.toFixed(1) + ' Q',
        envAmount: v => Math.round(v) + ' Hz',
        detune: v => Math.round(v) + ' ¢',
        lfo1Freq: v => v.toFixed(2) + ' Hz',
        lfo2Freq: v => v.toFixed(2) + ' Hz',
        lfoAmount: v => Math.round(v) + ' ¢',
        lfoDetune: v => v.toFixed(2) + ' ¢',
        lfoPan: v => v.toFixed(2),
        filterGain: u => {
          if (u <= 0) return '-∞ dB';
          const db = lerp(-60, 0, u);
          return Math.round(db) + ' dB';
        },
        delayLevel: v => Math.round(v * 100) + '%',
        delayTime: v => Math.round(v * 1000) + ' ms',
        delayFeedback: v => Math.round(v * 100) + '%'
      };
    }

    // Initialize UI and event handlers
    initUI() {
      if (this.isInitialized) return;
      
      const formatters = this.getFormatters();
      
      // Power button
      const powerBtn = document.getElementById('power');
      powerBtn.addEventListener('click', () => {
        if (!this.audioContext) {
          this.initAudio();
          powerBtn.textContent = 'Synth Active';
          powerBtn.style.background = '#90EE90';
        }
      });

      // Waveform selector knobs
      new SelectorKnob(document.getElementById('wave-knob'), (waveform) => {
        if (this.synth) this.synth.setWaveform(waveform);
      });

      new SelectorKnob(document.getElementById('lfo1-wave-knob'), (waveform) => {
        if (this.synth) this.synth.setLfoParams(1, { type: waveform });
      });

      new SelectorKnob(document.getElementById('lfo2-wave-knob'), (waveform) => {
        if (this.synth) this.synth.setLfoParams(2, { type: waveform });
      });

      // Filter type dropdown
      document.getElementById('filter-select').addEventListener('change', (e) => {
        const type = e.target.value;
        if (this.synth) this.synth.setFilterType(type);
        this.updateFilterKnobEnables(type);
      });

      // Legato toggle
      document.getElementById('legato').addEventListener('change', (e) => {
        if (this.synth) this.synth.setLegato(e.target.checked);
      });

      // LFO sync button
      document.getElementById('lfo-sync').addEventListener('click', () => {
        if (this.synth) this.synth.syncLFOs();
      });

      // LFO unipolar switches
      document.getElementById('lfo1-unipolar').addEventListener('change', (e) => {
        if (this.synth) this.synth.setLfoParams(1, { unipolar: e.target.checked });
      });

      document.getElementById('lfo2-unipolar').addEventListener('change', (e) => {
        if (this.synth) this.synth.setLfoParams(2, { unipolar: e.target.checked });
      });

      // LFO source selectors
      document.getElementById('filter-lfo-src').addEventListener('change', (e) => {
        if (this.synth) this.synth.setFilterLfoSource(e.target.value);
      });

      document.getElementById('detune-lfo-src').addEventListener('change', (e) => {
        if (this.synth) this.synth.setDetuneLfoSource(e.target.value);
      });

      document.getElementById('pan-lfo-src').addEventListener('change', (e) => {
        if (this.synth) this.synth.setPanLfoSource(e.target.value);
      });

      // Initialize knobs
      document.querySelectorAll('.knob').forEach(knobEl => {
        const param = knobEl.dataset.param;
        const formatter = formatters[param];

        this.knobs[param] = new Knob(knobEl, (value) => {
          // Update display
          const display = document.querySelector(`[data-for="${param}"]`);
          if (display) display.textContent = formatter(value);

          // Apply to synth
          if (!this.synth) return;

          switch (param) {
            case 'octave':
              if (this.keyboard) this.keyboard.setOctaveShift(Math.round(value));
              break;
            case 'master':
              this.synth.setMasterGain(value);
              break;
            case 'detune':
              this.synth.setDetuneBase(value);
              break;
            case 'attack':
            case 'decay':
            case 'sustain':
            case 'release':
              this.synth.setADSR(
                this.knobs.attack.value,
                this.knobs.decay.value,
                this.knobs.sustain.value,
                this.knobs.release.value
              );
              break;
            case 'cutoff':
              this.synth.setFilterCutoff(value);
              break;
            case 'resonance':
              this.synth.setFilterQ(value);
              break;
            case 'envAmount':
              this.synth.setFilterEnvAmount(value);
              break;
            case 'lfoAmount':
              this.synth.setFilterLfoAmount(value);
              break;
            case 'lfoDetune':
              this.synth.setDetuneLfoAmount(value);
              break;
            case 'lfoPan':
              this.synth.setPanLfoAmount(value);
              break;
            case 'lfo1Freq':
              this.synth.setLfoParams(1, { freq: value });
              break;
            case 'lfo2Freq':
              this.synth.setLfoParams(2, { freq: value });
              break;
            case 'filterGain':
              this.synth.setFilterGainFromNorm(value);
              break;
            case 'delayLevel':
              this.synth.setDelayLevel(value);
              break;
            case 'delayTime':
              this.synth.setDelayTime(value);
              break;
            case 'delayFeedback':
              this.synth.setDelayFeedback(value);
              break;
          }
        }, formatter);

        // Initial display update
        const display = document.querySelector(`[data-for="${param}"]`);
        if (display) display.textContent = formatter(this.knobs[param].value);
      });

      // Initialize keyboard
      const keyboardEl = document.getElementById('keyboard');
      this.keyboard = new PianoKeyboard(
        keyboardEl,
        (midi) => { if (this.synth) this.synth.noteOn(midi); },
        () => { if (this.synth) this.synth.noteOff(); }
      );

      this.isInitialized = true;
      console.log('VIBELAND Synth UI initialized');

      // Set initial enable/disable state for filter Gain/Q based on default type
      const initialType = document.getElementById('filter-select').value;
      this.updateFilterKnobEnables(initialType);

      // Align initial filter gain parameter with knob default
      if (this.synth && this.knobs.filterGain) {
        this.synth.setFilterGainFromNorm(this.knobs.filterGain.value);
      }
    }

    updateFilterKnobEnables(type) {
      const qKnob = document.querySelector('.knob[data-param="resonance"]');
      const gainKnob = document.getElementById('filter-gain-knob');
      if (!qKnob || !gainKnob) return;

      const gainEnabled = (type === 'lowshelf' || type === 'highshelf' || type === 'peaking');
      const qEnabled = !(type === 'lowshelf' || type === 'highshelf');

      // Toggle visual disabled state
      gainKnob.classList.toggle('disabled', !gainEnabled);
      qKnob.classList.toggle('disabled', !qEnabled);
    }
  }

  // Create and initialize the synthesizer app
  const synthApp = new SynthesizerApp();
  
  // Start everything when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    synthApp.initUI();
  });
})();
