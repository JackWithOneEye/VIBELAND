// VIBELAND lo-fi crusher: sample rate reduction (sample and hold) plus bit depth reduction.
// Loaded by synthesizer.js with audioWorklet.addModule; runs on the audio thread.
// At 16 bits and the full sample rate it passes audio through unchanged.
class CrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "bits", defaultValue: 16, minValue: 1, maxValue: 16, automationRate: "k-rate" },
      // Rate in Hz at which a new input sample is taken and held
      { name: "rate", defaultValue: sampleRate, minValue: 1, maxValue: sampleRate, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    this.phase = [];
    this.held = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const bits = parameters.bits[0];
    const step = parameters.rate[0] / sampleRate;
    const levels = Math.pow(2, bits - 1);

    for (let ch = 0; ch < output.length; ch++) {
      const inp = input[ch];
      const out = output[ch];
      if (!inp) {
        out.fill(0);
        continue;
      }
      let phase = this.phase[ch] || 0;
      let held = this.held[ch] || 0;
      for (let i = 0; i < out.length; i++) {
        // Take a new sample each time the phase wraps; at the full rate that is every sample
        phase += step;
        if (phase >= 1) {
          phase -= 1;
          held = inp[i];
        }
        out[i] = bits >= 16 ? held : Math.round(held * levels) / levels;
      }
      this.phase[ch] = phase;
      this.held[ch] = held;
    }
    return true;
  }
}

registerProcessor("crusher", CrusherProcessor);
