// Tile designs for Mahjong Solitaire. Each design draws every tile face as an SVG <symbol>
// with the ids the board uses ("bamboo-3", "wind-east", ...) and styles the tile body.
// The suit layouts are shared; each design draws its own dots, sticks, characters, winds,
// dragons and flowers. The "Tiles" button cycles through the designs.
{
  const NUMK = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const WINDS = { east: ["東", "E"], south: ["南", "S"], west: ["西", "W"], north: ["北", "N"] };
  const FLK = ["梅", "蘭", "菊", "竹"];
  const SERIF = "'Noto Serif CJK SC','Songti SC','STSong','SimSun','Hiragino Mincho ProN',serif";
  const f = (v) => +v.toFixed(2);

  // Text centered on (x, y) for glyphs whose ink sits mostly above the baseline.
  const TC = (x, y, size, s, fill, extra = "") =>
    `<text x="${f(x)}" y="${f(y + size * 0.36)}" font-size="${size}" text-anchor="middle" fill="${fill}" ${extra}>${s}</text>`;

  const DOTS = {
    2: [[50, 32], [50, 88]],
    3: [[24, 26], [50, 60], [76, 94]],
    4: [[29, 33], [71, 33], [29, 87], [71, 87]],
    5: [[27, 30], [73, 30], [50, 60], [27, 90], [73, 90]],
    6: [[29, 24], [71, 24], [29, 60], [71, 60], [29, 96], [71, 96]],
    7: [[22, 16], [50, 30], [78, 44], [29, 74], [71, 74], [29, 102], [71, 102]],
    8: [[29, 17], [71, 17], [29, 46], [71, 46], [29, 74], [71, 74], [29, 103], [71, 103]],
    9: [[22, 22], [50, 22], [78, 22], [22, 60], [50, 60], [78, 60], [22, 98], [50, 98], [78, 98]]
  };
  const DOT_R = { 2: 20, 3: 15, 4: 17, 5: 15, 6: 13, 7: 11, 8: 11, 9: 12 };
  // Colors follow real tiles loosely: 0 blue, 1 green, 2 red.
  const DOT_COL = {
    2: [1, 0], 3: [0, 2, 1], 4: [0, 1, 1, 0], 5: [0, 1, 2, 1, 0], 6: [1, 1, 2, 2, 2, 2],
    7: [1, 1, 1, 2, 2, 2, 2], 8: [0, 0, 0, 0, 0, 0, 0, 0], 9: [0, 0, 0, 2, 2, 2, 1, 1, 1]
  };
  const STICKS = {
    2: [[50, 33, 46], [50, 87, 46]],
    3: [[50, 33, 46], [32, 87, 46], [68, 87, 46]],
    4: [[32, 33, 46], [68, 33, 46], [32, 87, 46], [68, 87, 46]],
    5: [[26, 33, 46], [74, 33, 46], [50, 60, 46], [26, 87, 46], [74, 87, 46]],
    6: [[22, 33, 46], [50, 33, 46], [78, 33, 46], [22, 87, 46], [50, 87, 46], [78, 87, 46]],
    7: [[50, 20, 30], [22, 62, 30], [50, 62, 30], [78, 62, 30], [22, 100, 30], [50, 100, 30], [78, 100, 30]],
    8: [[18, 33, 46], [39, 33, 46], [61, 33, 46], [82, 33, 46], [18, 87, 46], [39, 87, 46], [61, 87, 46], [82, 87, 46]],
    9: [[22, 22, 32], [50, 22, 32], [78, 22, 32], [22, 60, 32], [50, 60, 32], [78, 60, 32], [22, 98, 32], [50, 98, 32], [78, 98, 32]]
  };
  // 0 main color, 1 red accent, 2 second color.
  const STICK_COL = {
    2: [0, 0], 3: [2, 0, 0], 4: [0, 2, 2, 0], 5: [0, 0, 1, 0, 0], 6: [0, 0, 0, 2, 2, 2],
    7: [1, 0, 0, 0, 0, 0, 0], 8: [0, 2, 2, 0, 0, 2, 2, 0], 9: [0, 1, 0, 0, 1, 0, 0, 1, 0]
  };

  // A peacock: a fan of nine eyed feathers over a small body. Styles come from the theme.
  function peacock(o) {
    let s = "";
    for (let i = 0; i < 9; i++) {
      const a = -64 + i * 16;
      s += `<g transform="rotate(${a} 50 82)"><ellipse cx="50" cy="52" rx="8" ry="28" ${o.feather(i)}/>` +
        `<circle cx="50" cy="34" r="5.5" ${o.eyeOuter(i)}/><circle cx="50" cy="34" r="2.6" ${o.eyeInner(i)}/></g>`;
    }
    s += `<line x1="46" y1="102" x2="43" y2="114" ${o.leg}/><line x1="54" y1="102" x2="57" y2="114" ${o.leg}/>`;
    s += `<ellipse cx="50" cy="88" rx="11" ry="17" ${o.body}/><circle cx="50" cy="66" r="7.5" ${o.body}/>`;
    for (const [x, y] of [[44, 50], [50, 48], [56, 50]]) {
      s += `<line x1="50" y1="59" x2="${x}" y2="${y + 3}" ${o.leg}/><circle cx="${x}" cy="${y}" r="2.2" ${o.crest}/>`;
    }
    s += `<polygon points="47,69 53,69 50,75" ${o.beak}/><circle cx="47.5" cy="65" r="1.4" ${o.eye}/><circle cx="52.5" cy="65" r="1.4" ${o.eye}/>`;
    return s;
  }

  // A crane in flight, used for the 1-bamboo. Colors come from the theme.
  function crane(o) {
    return `<path d="M48 62 C 30 30, 14 26, 6 22 C 20 40, 30 54, 44 68 Z" fill="${o.wing}" stroke="${o.ink}" stroke-width="1.6"/>` +
      `<path d="M56 60 C 66 30, 82 18, 95 14 C 86 34, 76 52, 62 68 Z" fill="${o.wing}" stroke="${o.ink}" stroke-width="1.6"/>` +
      `<path d="M20 30 L30 38 M28 26 L36 40 M84 22 L76 36 M90 20 L80 32" stroke="${o.ink}" stroke-width="1.2"/>` +
      `<line x1="50" y1="74" x2="40" y2="106" stroke="${o.ink}" stroke-width="1.6"/><line x1="55" y1="75" x2="48" y2="108" stroke="${o.ink}" stroke-width="1.6"/>` +
      `<path d="M36 72 L20 82 L32 68 Z" fill="${o.dark}"/>` +
      `<ellipse cx="52" cy="67" rx="19" ry="10" fill="${o.body}" stroke="${o.ink}" stroke-width="1.8" transform="rotate(-20 52 67)"/>` +
      `<path d="M66 60 C 76 52, 80 42, 74 32" stroke="${o.ink}" stroke-width="3" fill="none"/>` +
      `<circle cx="74" cy="30" r="4.5" fill="${o.body}" stroke="${o.ink}" stroke-width="1.6"/><circle cx="74" cy="26.5" r="2.2" fill="${o.crown}"/>` +
      `<line x1="78" y1="31" x2="90" y2="37" stroke="${o.dark}" stroke-width="1.8" stroke-linecap="round"/>`;
  }

  // Plum, orchid, chrysanthemum and bamboo: the four traditional flower tiles.
  function flowerArt(k, c) {
    const cx = 50, cy = 54;
    const P = `fill="${c.petal}" stroke="${c.stroke}" stroke-width="${c.sw}"`;
    let s = "";
    if (k === 0) {
      for (let i = 0; i < 5; i++) {
        const a = (-90 + 72 * i) * Math.PI / 180;
        s += `<circle cx="${f(cx + Math.cos(a) * 13)}" cy="${f(cy + Math.sin(a) * 13)}" r="11" ${P}/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="6.5" fill="${c.center}" stroke="${c.stroke}" stroke-width="${c.sw}"/>`;
    } else if (k === 1) {
      for (const a of [60, 300]) s += `<ellipse cx="${cx}" cy="${cy - 13}" rx="3.5" ry="14" transform="rotate(${a} ${cx} ${cy})" ${P}/>`;
      for (const a of [0, 120, 240]) s += `<ellipse cx="${cx}" cy="${cy - 16}" rx="7.5" ry="17" transform="rotate(${a} ${cx} ${cy})" ${P}/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${c.center}" stroke="${c.stroke}" stroke-width="${c.sw}"/>`;
    } else if (k === 2) {
      for (let i = 0; i < 16; i++) s += `<ellipse cx="${cx}" cy="${cy - 16}" rx="3.4" ry="13" transform="rotate(${i * 22.5} ${cx} ${cy})" ${P}/>`;
      for (let i = 0; i < 8; i++) s += `<ellipse cx="${cx}" cy="${cy - 8}" rx="3" ry="8" transform="rotate(${22.5 + i * 45} ${cx} ${cy})" ${P}/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${c.center}" stroke="${c.stroke}" stroke-width="${c.sw}"/>`;
    } else {
      const L = `fill="${c.leaf}" stroke="${c.stroke}" stroke-width="${c.sw}"`;
      s += `<rect x="45" y="22" width="9" height="70" rx="3" ${L}/>`;
      for (const y of [40, 60, 78]) s += `<line x1="44" y1="${y}" x2="55" y2="${y}" stroke="${c.stroke}" stroke-width="${c.sw + 0.6}"/>`;
      s += `<ellipse cx="66" cy="34" rx="5" ry="15" transform="rotate(55 66 34)" ${L}/>`;
      s += `<ellipse cx="68" cy="54" rx="4.5" ry="13" transform="rotate(75 68 54)" ${L}/>`;
      s += `<ellipse cx="33" cy="48" rx="5" ry="14" transform="rotate(-60 33 48)" ${L}/>`;
    }
    return s;
  }

  const ring = (cx, cy, r, attrs) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${attrs}/>`;
  const radial = (id, a, b) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const linear = (id, stops, horizontal) => `<linearGradient id="${id}" x1="0" y1="0" x2="${horizontal ? 1 : 0}" y2="${horizontal ? 0 : 1}">${stops.map((c, i) => `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`).join("")}</linearGradient>`;

  // ---------- Imperial Jade ----------
  const imperial = {
    id: "imperial",
    name: "Imperial Jade",
    css: (s) => `${s}{background:linear-gradient(160deg,#fffdf6 0%,#f4ead3 100%);border:3px solid #c9a24a;border-radius:7px;box-shadow:inset 0 0 0 1.5px #fff7dc,inset 0 0 0 3px rgba(201,162,74,.45),3px 4px 0 #0f6b45,4px 6px 8px rgba(0,0,0,.35)}`,
    defs: (p) =>
      radial(`${p}d0`, "#6f9be8", "#1f4e9c") + radial(`${p}d1`, "#4cc98d", "#0f7a4a") + radial(`${p}d2`, "#f07a7a", "#b81f2a") +
      linear(`${p}s0`, ["#0b5a37", "#4fc58f", "#0b5a37"], true) + linear(`${p}s1`, ["#8e1520", "#f07070", "#8e1520"], true) +
      linear(`${p}s2`, ["#14386f", "#6f9fe8", "#14386f"], true) + linear(`${p}fth`, ["#2bb07a", "#0b5a37"]) +
      linear(`${p}gold`, ["#fbe7a0", "#d9aa45", "#9c7020"]),
    dot: (x, y, r, c, p) =>
      ring(x, y, r, `fill="url(#${p}d${c})" stroke="#7a5a12" stroke-width="${f(r * 0.06)}"`) +
      ring(x, y, r * 0.7, `fill="none" stroke="#fff8e6" stroke-width="${f(r * 0.13)}" stroke-dasharray="${f(r * 0.22)} ${f(r * 0.16)}"`) +
      ring(x, y, r * 0.34, `fill="url(#${p}gold)"`) + ring(x, y, r * 0.14, `fill="#7a1018"`),
    dot1: (p) => {
      let s = ring(50, 60, 34, `fill="url(#${p}d1)" stroke="#7a5a12" stroke-width="2"`);
      for (let i = 0; i < 16; i++) s += `<ellipse cx="50" cy="34" rx="3.2" ry="6.5" fill="#fff8e6" transform="rotate(${i * 22.5} 50 60)"/>`;
      return s + ring(50, 60, 19, `fill="url(#${p}d2)" stroke="url(#${p}gold)" stroke-width="2.5"`) +
        ring(50, 60, 12.5, `fill="none" stroke="#fff8e6" stroke-width="1.8" stroke-dasharray="3 2.4"`) + ring(50, 60, 6, `fill="url(#${p}gold)"`);
    },
    stick: (x, cy, len, w, c, p) => {
      const dark = ["#073b24", "#5e0d15", "#0d2650"][c], y0 = cy - len / 2;
      return `<rect x="${f(x - w / 2)}" y="${f(y0)}" width="${w}" height="${len}" rx="${f(w * 0.45)}" fill="url(#${p}s${c})" stroke="${dark}" stroke-width="1"/>` +
        `<rect x="${f(x - w / 2 - 1)}" y="${f(cy - 1.6)}" width="${w + 2}" height="3.2" rx="1.6" fill="${dark}"/>` +
        `<line x1="${f(x - w * 0.15)}" y1="${f(y0 + 4)}" x2="${f(x - w * 0.15)}" y2="${f(cy - 4)}" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>`;
    },
    bam1: (p) => peacock({
      feather: () => `fill="url(#${p}fth)" stroke="#0b5a37" stroke-width=".8"`,
      eyeOuter: () => `fill="url(#${p}gold)"`, eyeInner: () => `fill="#1f4e9c"`,
      body: `fill="url(#${p}d0)" stroke="#14386f" stroke-width="1"`, beak: `fill="#d9a22b"`,
      eye: `fill="#fff"`, leg: `stroke="#7a5a12" stroke-width="1.6" stroke-linecap="round"`, crest: `fill="url(#${p}gold)"`
    }),
    char: (n) => TC(50, 36, 46, NUMK[n - 1], "#1b2a5c", `font-family="${SERIF}" font-weight="700"`) +
      TC(50, 88, 54, "萬", "#b81f2a", `font-family="${SERIF}" font-weight="900"`),
    wind: (k, p) => TC(50, 62, 76, WINDS[k][0], "#1b2a5c", `font-family="${SERIF}" font-weight="900"`) +
      `<text x="9" y="21" font-size="17" font-family="Georgia,serif" font-weight="700" fill="url(#${p}gold)" stroke="#7a5a12" stroke-width=".5">${WINDS[k][1]}</text>`,
    dragon: (k, p) => k === "white"
      ? `<rect x="18" y="22" width="64" height="76" rx="6" fill="none" stroke="#1f4e9c" stroke-width="5"/>` +
        `<rect x="27" y="31" width="46" height="58" rx="3" fill="none" stroke="url(#${p}gold)" stroke-width="2.5"/>` +
        `<path d="M50 46 L61 60 L50 74 L39 60Z" fill="none" stroke="url(#${p}gold)" stroke-width="2.5"/>`
      : TC(50, 60, 82, k === "red" ? "中" : "發", k === "red" ? "#c0262d" : "#0f7a4a",
        `font-family="${SERIF}" font-weight="900" stroke="url(#${p}gold)" stroke-width="2.4" paint-order="stroke"`),
    flower: (k, p) => flowerArt(k, { petal: ["#e0457b", "#9b4dca", "#e3a21a", "#0f7a4a"][k], stroke: "#7a5a12", sw: 0.8, center: `url(#${p}gold)`, leaf: "#2bb07a" }) +
      ring(15, 17, 9.5, `fill="#c0262d"`) + `<text x="15" y="22" font-size="14" text-anchor="middle" fill="#fff" font-family="Georgia,serif" font-weight="700">${k + 1}</text>` +
      TC(50, 103, 17, FLK[k], "#1b2a5c", `font-family="${SERIF}" font-weight="700"`)
  };

  // ---------- Ming Porcelain ----------
  const COB = "#1e3f91", MID = "#3d63b8", DEEP = "#122a63", WASH = "#c9d7f2", IRON = "#b23a2e";
  const lotus = (x, y, r, petal) => {
    let s = ring(x, y, r, `fill="${WASH}" stroke="${COB}" stroke-width="${f(r * 0.1)}"`);
    for (let i = 0; i < 8; i++) s += `<ellipse cx="${f(x)}" cy="${f(y - r * 0.55)}" rx="${f(r * 0.2)}" ry="${f(r * 0.32)}" fill="${petal}" transform="rotate(${i * 45} ${f(x)} ${f(y)})"/>`;
    return s + ring(x, y, r * 0.24, `fill="${COB}"`) + ring(x, y, r * 0.1, `fill="#fff"`);
  };
  const ming = {
    id: "ming",
    name: "Ming Porcelain",
    css: (s) => `${s}{background:radial-gradient(circle at 35% 25%,#ffffff 0%,#eef3fb 70%,#dfe8f7 100%);border:3px solid #1e3f91;border-radius:7px;box-shadow:inset 0 0 0 2px #fff,inset 0 0 0 3.5px #9db3e2,3px 4px 0 #1e3f91,4px 6px 8px rgba(0,0,0,.3)}`,
    defs: () => "",
    dot: (x, y, r, c) => lotus(x, y, r, [COB, MID, DEEP][c]),
    dot1: () => {
      let s = ring(50, 60, 34, `fill="${WASH}" stroke="${COB}" stroke-width="2.5"`);
      for (let i = 0; i < 12; i++) s += `<ellipse cx="50" cy="36" rx="5" ry="9" fill="${COB}" transform="rotate(${i * 30} 50 60)"/>`;
      s += ring(50, 60, 14, `fill="#fff" stroke="${COB}" stroke-width="2"`);
      for (let i = 0; i < 6; i++) s += `<ellipse cx="50" cy="52" rx="2.6" ry="5" fill="${MID}" transform="rotate(${i * 60} 50 60)"/>`;
      return s + ring(50, 60, 3.5, `fill="${IRON}"`);
    },
    stick: (x, cy, len, w, c) => {
      const col = [COB, IRON, MID][c], y0 = cy - len / 2, side = x < 50 ? -1 : 1;
      return `<ellipse cx="${f(x + side * w * 0.85)}" cy="${f(cy - 6)}" rx="2.8" ry="7" fill="${col}" transform="rotate(${side * 35} ${f(x + side * w * 0.85)} ${f(cy - 6)})"/>` +
        `<rect x="${f(x - w / 2)}" y="${f(y0)}" width="${w}" height="${len}" rx="${f(w * 0.4)}" fill="${WASH}" stroke="${col}" stroke-width="1.6"/>` +
        `<line x1="${f(x - w / 2)}" y1="${cy}" x2="${f(x + w / 2)}" y2="${cy}" stroke="${col}" stroke-width="2"/>` +
        `<line x1="${f(x)}" y1="${f(y0 + 4)}" x2="${f(x)}" y2="${f(y0 + len - 4)}" stroke="${col}" stroke-width=".8" stroke-opacity=".6"/>`;
    },
    bam1: () => crane({ wing: WASH, ink: COB, dark: DEEP, body: "#fff", crown: IRON }),
    char: (n) => TC(50, 36, 46, NUMK[n - 1], COB, `font-family="${SERIF}" font-weight="700"`) +
      TC(50, 88, 54, "萬", IRON, `font-family="${SERIF}" font-weight="900"`),
    wind: (k) => ring(50, 60, 40, `fill="none" stroke="${MID}" stroke-width="1.2" stroke-dasharray="2 3"`) +
      ring(50, 60, 35, `fill="none" stroke="${COB}" stroke-width="1.6"`) + TC(50, 60, 52, WINDS[k][0], COB, `font-family="${SERIF}" font-weight="900"`),
    dragon: (k) => k === "white"
      ? `<rect x="16" y="20" width="68" height="80" rx="3" fill="none" stroke="${COB}" stroke-width="6" stroke-dasharray="6 3"/>` +
        `<rect x="25" y="29" width="50" height="62" rx="2" fill="none" stroke="${COB}" stroke-width="2"/>` + lotus(50, 60, 9, COB)
      : ring(50, 60, 40, `fill="none" stroke="${COB}" stroke-width="2.4"`) + ring(50, 60, 35, `fill="none" stroke="${COB}" stroke-width="1"`) +
        TC(50, 60, 56, k === "red" ? "中" : "發", k === "red" ? IRON : "#1d7a6b", `font-family="${SERIF}" font-weight="900"`),
    flower: (k) => flowerArt(k, { petal: WASH, stroke: COB, sw: 1.4, center: k === 0 ? IRON : COB, leaf: WASH }) +
      `<text x="14" y="21" font-size="14" text-anchor="middle" font-family="Georgia,serif" font-weight="700" fill="${IRON}">${k + 1}</text>` +
      TC(50, 103, 17, FLK[k], COB, `font-family="${SERIF}" font-weight="700"`)
  };

  // ---------- Ink & Seal ----------
  const INK = "#1f1d1a", SEAL = "#c23b2e", PAPER = "#f7f1e1";
  const seal = (x, y, s, ch, size) => `<rect x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${s}" height="${s}" rx="${f(s * 0.12)}" fill="${SEAL}"/>` +
    TC(x, y, size, ch, PAPER, `font-family="${SERIF}" font-weight="900"`);
  const enso = (x, y, r, col, w, turn) => {
    const C = 2 * Math.PI * r;
    return ring(x, y, r, `fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-dasharray="${f(C * 0.86)} ${f(C)}" transform="rotate(${turn} ${f(x)} ${f(y)})"`);
  };
  const ink = {
    id: "ink",
    name: "Ink & Seal",
    css: (s) => `${s}{background:radial-gradient(circle at 30% 20%,#fffaf0 0%,#f3ead3 70%,#e9dcbc 100%);border:3px solid #d6c7a1;border-radius:6px;box-shadow:inset 0 0 0 1.5px #fffaf0,3px 4px 0 #5a3a22,4px 6px 8px rgba(0,0,0,.35)}`,
    defs: (p) => `<filter id="${p}brush" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`,
    wrap: (m, p) => `<g filter="url(#${p}brush)">${m}</g>`,
    dot: (x, y, r, c) => {
      const col = [INK, "#6b6b63", SEAL][c];
      return ring(x, y, r * 0.82, `fill="${col}" fill-opacity=".12"`) + enso(x, y, r * 0.82, col, r * 0.26, -70 + ((x * 7 + y * 3) % 40)) + ring(x, y, r * 0.14, `fill="${col}"`);
    },
    dot1: () => ring(50, 60, 30, `fill="${INK}" fill-opacity=".08"`) + enso(50, 60, 30, INK, 7, -60) + seal(50, 60, 20, "筒", 15),
    stick: (x, cy, len, w0, c) => {
      const col = [INK, SEAL, "#4a5d4a"][c], w = w0 * 0.62, y0 = cy - len / 2, y1 = cy + len / 2;
      const seg = (ya, yb) => `<rect x="${f(x - w / 2)}" y="${f(ya)}" width="${f(w)}" height="${f(yb - ya)}" rx="${f(w * 0.25)}" fill="${col}" fill-opacity=".85"/>`;
      const node = (y) => `<path d="M${f(x - w / 2 - 2.5)} ${f(y + 1)} Q ${f(x)} ${f(y - 1.8)} ${f(x + w / 2 + 2.5)} ${f(y + 1)}" stroke="${col}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      return seg(y0 + 1, cy - 2) + seg(cy + 2, y1 - 1) + node(cy) + node(y0 + 1) + node(y1 - 2) +
        `<line x1="${f(x - w * 0.15)}" y1="${f(y0 + 5)}" x2="${f(x - w * 0.15)}" y2="${f(cy - 5)}" stroke="${PAPER}" stroke-opacity=".4" stroke-width="1"/>`;
    },
    bam1: () =>
      `<path d="M6 98 Q 50 88, 96 99" stroke="#4a3a2a" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="24" cy="104" rx="3" ry="9" fill="${INK}" transform="rotate(-60 24 104)"/><ellipse cx="80" cy="104" rx="3" ry="9" fill="${INK}" transform="rotate(50 80 104)"/>` +
      `<path d="M50 85 L47 93 M58 85 L61 93" stroke="${INK}" stroke-width="1.4"/>` +
      `<path d="M66 72 L93 63 L89 75 Z" fill="#4a3a2a"/>` +
      `<ellipse cx="54" cy="72" rx="20" ry="15" fill="#a98563"/>` +
      `<ellipse cx="48" cy="80" rx="12" ry="7" fill="#efe4cc"/>` +
      `<path d="M44 66 Q 62 57, 77 69 Q 62 80, 46 76 Z" fill="#5c4330"/>` +
      `<path d="M52 67 l8 4 M58 65 l8 5 M64 66 l6 4" stroke="#2a1d12" stroke-width="1.2"/>` +
      ring(36, 59, 11, `fill="#7a5235"`) + `<ellipse cx="34" cy="64" rx="6" ry="4" fill="#f3ead6"/>` + ring(36, 64, 1.8, `fill="${INK}"`) +
      `<ellipse cx="30" cy="70" rx="4" ry="3.5" fill="${INK}"/>` + ring(32, 57, 1.8, `fill="${INK}"`) +
      `<path d="M26 58 L18 61 L26 63 Z" fill="${INK}"/>` + seal(84, 22, 17, "雀", 13),
    char: (n) => TC(50, 34, 44, NUMK[n - 1], INK, `font-family="${SERIF}" font-weight="900"`) + seal(50, 87, 42, "萬", 33),
    wind: (k) => enso(50, 60, 38, INK, 9, -40).replace('stroke="#1f1d1a"', 'stroke="#1f1d1a" stroke-opacity=".16"') +
      TC(50, 61, 68, WINDS[k][0], INK, `font-family="${SERIF}" font-weight="900"`),
    dragon: (k) => k === "red" ? seal(50, 60, 64, "中", 52)
      : k === "green" ? TC(50, 61, 80, "發", "#2f5d3a", `font-family="${SERIF}" font-weight="900"`)
      : `<rect x="20" y="30" width="60" height="60" rx="7" fill="none" stroke="${SEAL}" stroke-width="4"/><rect x="28" y="38" width="44" height="44" rx="4" fill="none" stroke="${SEAL}" stroke-width="1.4"/>`,
    flower: (k) => {
      let s = "";
      const blossom = (x, y, r, col) => [0, 1, 2, 3, 4].map((i) => { const a = (-90 + 72 * i) * Math.PI / 180; return ring(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.95, `fill="${col}"`); }).join("") + ring(x, y, r * 0.5, `fill="${INK}"`);
      if (k === 0) {
        s += `<path d="M14 98 Q 40 82, 46 62 Q 52 42, 82 24" stroke="#3b2a1e" stroke-width="4" fill="none" stroke-linecap="round"/>` +
          `<path d="M46 64 Q 62 66, 76 54" stroke="#3b2a1e" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
          blossom(80, 26, 4, "#d9534f") + blossom(74, 54, 3.6, "#d9534f") + blossom(36, 76, 3.8, "#d9534f") + blossom(58, 38, 3.2, "#e57373");
      } else if (k === 1) {
        s += `<g stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M50 98 Q 30 62, 12 32"/><path d="M52 98 Q 60 62, 88 36"/><path d="M50 98 Q 44 72, 50 46"/><path d="M48 98 Q 34 80, 24 74"/></g>`;
        for (const a of [0, 120, 240]) s += `<ellipse cx="56" cy="36" rx="3.4" ry="8" fill="#7d5ba6" transform="rotate(${a} 56 44)"/>`;
        s += ring(56, 44, 2.2, `fill="${INK}"`);
      } else if (k === 2) {
        s += `<ellipse cx="34" cy="86" rx="4" ry="12" fill="${INK}" transform="rotate(-50 34 86)"/><ellipse cx="66" cy="88" rx="4" ry="12" fill="${INK}" transform="rotate(50 66 88)"/>` +
          flowerArt(2, { petal: "#f0c75e", stroke: INK, sw: 0.9, center: "#b8862a" });
      } else {
        s += flowerArt(3, { petal: INK, stroke: INK, sw: 0.4, center: INK, leaf: INK });
      }
      return s + seal(15, 17, 17, ["一", "二", "三", "四"][k], 12) + TC(50, 104, 17, FLK[k], INK, `font-family="${SERIF}" font-weight="900"`);
    }
  };


  const THEMES = [imperial, ming, ink];
  const FACES = [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `bamboo-${n}`),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `char-${n}`),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `circle-${n}`),
    "wind-east", "wind-south", "wind-west", "wind-north", "dragon-red", "dragon-green", "dragon-white",
    "flower-1", "flower-2", "flower-3", "flower-4"
  ];

  function face(t, id, p) {
    const [kind, v] = id.split("-");
    const n = +v;
    let m;
    if (kind === "circle") m = n === 1 ? t.dot1(p) : DOTS[n].map(([x, y], i) => t.dot(x, y, DOT_R[n], DOT_COL[n][i], p)).join("");
    else if (kind === "bamboo") m = n === 1 ? t.bam1(p) : STICKS[n].map(([x, cy, len], i) => t.stick(x, cy, len, n === 8 ? 11 : 13, STICK_COL[n][i], p)).join("");
    else if (kind === "char") m = t.char(n, p);
    else if (kind === "wind") m = t.wind(v, p);
    else if (kind === "dragon") m = t.dragon(v, p);
    else m = t.flower(n - 1, p);
    return t.wrap ? t.wrap(m, p) : m;
  }


  // Gradient and filter ids carry the design id, so they never collide with the page.
  function symbols(t) {
    const p = `${t.id}-`;
    return t.defs(p) + FACES.map((id) => `<symbol id="${id}" viewBox="0 0 100 120">${face(t, id, p)}</symbol>`).join("");
  }

  // Swapping the symbols redraws every <use> on the board in place. The tile body rule uses a
  // plain .tile-inner selector so the board's selected and hint styles still win over it.
  const style = document.createElement("style");
  document.head.appendChild(style);
  const button = document.getElementById("tile-theme");
  let current = 0;

  function applyTheme(index) {
    current = index;
    const t = THEMES[index];
    document.querySelector("#sprite defs").innerHTML = symbols(t);
    style.textContent = t.css(".tile-inner");
    button.textContent = `Tiles: ${t.name}`;
  }

  button.addEventListener("click", () => applyTheme((current + 1) % THEMES.length));
  applyTheme(0);
}
