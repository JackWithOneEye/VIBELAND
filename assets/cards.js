// Real playing card faces, shared by Solitaire and FreeCell.
// cardFaceHTML(rank, suit, courtStyle) returns the inner HTML for a face-up card:
// rank is "A", "2" … "10", "J", "Q" or "K"; suit is one of "♠", "♥", "♦", "♣";
// courtStyle picks the J, Q and K artwork: "classic" (Solitaire) or "pixel" (FreeCell).

const CARD_SUIT_PATHS = {
  "♠": "M50 4C62 22 94 40 94 62C94 76 84 84 72 84C63 84 56 79 53 73C54 84 58 92 66 97L34 97C42 92 46 84 47 73C44 79 37 84 28 84C16 84 6 76 6 62C6 40 38 22 50 4Z",
  "♥": "M50 94C20 68 4 52 4 31C4 15 16 5 29 5C39 5 46 11 50 20C54 11 61 5 71 5C84 5 96 15 96 31C96 52 80 68 50 94Z",
  "♦": "M50 2C60 22 72 38 86 50C72 62 60 78 50 98C40 78 28 62 14 50C28 38 40 22 50 2Z",
  "♣": "M50 6A21 21 0 1 1 49.9 6ZM28 38A21 21 0 1 1 27.9 38ZM72 38A21 21 0 1 1 71.9 38ZM42 46L58 46L56 68L44 68ZM50 56C52 78 58 89 68 97L32 97C42 89 48 78 50 56Z",
};

const CARD_RED = "#c8102e";
const CARD_BLUE = "#1e4fa0";
const CARD_GOLD = "#f2c230";
const CARD_SKIN = "#fde2c4";
const CARD_INK = "#222";

// Pip centres as [x%, y%] on the card; pips below the middle are drawn upside down like a real deck.
const CARD_PIP_LAYOUTS = {
  "2": [[50, 20], [50, 80]],
  "3": [[50, 20], [50, 50], [50, 80]],
  "4": [[34, 20], [66, 20], [34, 80], [66, 80]],
  "5": [[34, 20], [66, 20], [50, 50], [34, 80], [66, 80]],
  "6": [[34, 20], [66, 20], [34, 50], [66, 50], [34, 80], [66, 80]],
  "7": [[34, 20], [66, 20], [50, 35], [34, 50], [66, 50], [34, 80], [66, 80]],
  "8": [[34, 20], [66, 20], [50, 35], [34, 50], [66, 50], [50, 65], [34, 80], [66, 80]],
  "9": [[34, 20], [66, 20], [34, 40], [66, 40], [50, 50], [34, 60], [66, 60], [34, 80], [66, 80]],
  "10": [[34, 20], [66, 20], [50, 30], [34, 40], [66, 40], [34, 60], [66, 60], [50, 70], [34, 80], [66, 80]],
};

function cardSuitSVG(suit, attrs = "") {
  return `<svg viewBox="0 0 100 100" ${attrs}><path d="${CARD_SUIT_PATHS[suit]}" fill="currentColor"/></svg>`;
}

function cardFaceHTML(rank, suit, courtStyle) {
  const red = suit === "♥" || suit === "♦";
  const index = `<span class="card-rank${rank === "10" ? " ten" : ""}">${rank}</span>${cardSuitSVG(suit)}`;
  let middle;
  if (rank === "A") {
    middle = cardSuitSVG(suit, `class="card-pip card-ace${suit === "♠" ? " spade" : ""}" style="left:50%;top:50%"`);
  } else if (CARD_PIP_LAYOUTS[rank]) {
    middle = CARD_PIP_LAYOUTS[rank].map(([x, y]) =>
      cardSuitSVG(suit, `class="card-pip${y > 50 ? " flip" : ""}" style="left:${x}%;top:${y}%"`)).join("");
  } else {
    middle = `<div class="card-court">${cardCourtSVG(rank, suit, courtStyle)}</div>`;
  }
  return `<div class="card-face ${red ? "red" : "black"}">
    <div class="card-index">${index}</div>
    <div class="card-index bottom">${index}</div>
    ${middle}
  </div>`;
}

// ---- Court cards (J, Q, K) ----
// Each design draws the top half of a 40×88 double-ended court and repeats it rotated 180°.
// Every suit has its own colours (and, in the classic style, its own props), so no two court cards look alike.

const CARD_COURT_COLORS = {
  "♥": {robe: CARD_RED, trim: CARD_BLUE, hair: "#b5651d"},
  "♦": {robe: "#6a1b9a", trim: "#f28c28", hair: "#efe3b0"},
  "♣": {robe: "#2e7d32", trim: CARD_RED, hair: "#2b2b2b"},
  "♠": {robe: CARD_BLUE, trim: "#111", hair: "#7a4a24"},
};

function cardCourtSVG(rank, suit, style) {
  const colors = CARD_COURT_COLORS[suit];
  let half;
  if (style === "pixel") {
    half = cardPixelHalf(rank, colors);
  } else {
    const pipColor = suit === "♥" || suit === "♦" ? CARD_RED : "#111";
    half = cardClassicHalf(rank, suit, colors) +
      `<svg x="2" y="2" width="7" height="7" viewBox="0 0 100 100"><path d="${CARD_SUIT_PATHS[suit]}" fill="${pipColor}"/></svg>`;
  }
  return `<svg viewBox="0 0 40 88" preserveAspectRatio="xMidYMid slice">
    <g>${half}</g><g transform="rotate(180 20 44)">${half}</g>
    <line x1="0" y1="44" x2="40" y2="44" stroke="${CARD_INK}" stroke-width="0.6"/></svg>`;
}

// What each court holds: kings and queens in their right hand, jacks in their left.
function cardClassicProp(rank, suit, c, line) {
  const wood = `fill="#7a4a24" ${line}`;
  const gold = `fill="${CARD_GOLD}" ${line}`;
  const steel = `fill="#e8e8e8" ${line}`;
  const props = {
    K: {
      "♥": `<rect x="31.2" y="3" width="1.6" height="29" ${steel}/><path d="M31.2 3L32 0.6L32.8 3Z" ${steel}/>
        <rect x="27.5" y="31" width="9" height="1.8" rx="0.6" ${gold}/>`,
      "♦": `<rect x="31.3" y="3" width="1.4" height="31" ${wood}/><path d="M32.7 4.5Q37.5 3.5 38 9Q37.5 14 32.7 13Z" ${steel}/>`,
      "♣": `<rect x="31.4" y="22.6" width="1.2" height="4.4" ${gold}/><rect x="30.3" y="23.8" width="3.4" height="1.2" ${gold}/>
        <circle cx="32" cy="30" r="3.2" ${gold}/><path d="M28.8 30H35.2" ${line}/>`,
      "♠": `<rect x="31.4" y="7" width="1.2" height="27" ${gold}/><circle cx="32" cy="6" r="1.8" ${gold}/>
        <path d="M32 1.2L33.2 3.4L32 4.6L30.8 3.4Z" fill="${CARD_RED}" ${line}/>`,
    },
    Q: {
      "♥": `<path d="M31 40V23" stroke="#2e7d32" stroke-width="0.9"/><path d="M31 31Q34 28 35.5 29Q33 31 31 32Z" fill="#2e7d32"/>
        <path d="M28.6 23.5Q28.4 18.6 31 17.6Q33.6 18.6 33.4 23.5Q31 25 28.6 23.5Z" fill="${CARD_RED}" ${line}/>`,
      "♦": `<path d="M31 35L26 26.5Q31 23.5 36 26.5Z" fill="${c.trim}" ${line}/>
        <path d="M31 35L28.5 25M31 35V24.5M31 35L33.5 25" stroke="${CARD_GOLD}" stroke-width="0.5"/>`,
      "♣": `<path d="M31 40V25" stroke="#1b5e20" stroke-width="0.9"/>
        <circle cx="31" cy="21.8" r="1.8" fill="#43a047" ${line}/><circle cx="29.3" cy="24.6" r="1.8" fill="#43a047" ${line}/><circle cx="32.7" cy="24.6" r="1.8" fill="#43a047" ${line}/>`,
      "♠": `<rect x="30.4" y="10" width="1.2" height="25" ${gold}/><circle cx="31" cy="8.6" r="1.7" ${gold}/>
        <rect x="30.5" y="4" width="1" height="3.4" ${gold}/><rect x="29.4" y="5" width="3.2" height="1" ${gold}/>`,
    },
    J: {
      "♥": `<rect x="7" y="15" width="1.4" height="22" ${wood}/><path d="M5.2 13.5H10.2L9.2 16.5H6.2Z" ${gold}/>
        <path d="M7.7 4Q4.6 9 5.4 12Q7.7 14.4 10 12Q10.8 9 7.7 4Z" fill="#f28c28" ${line}/>
        <path d="M7.7 7.5Q6.4 10 6.8 11.6Q7.7 12.6 8.6 11.6Q9 10 7.7 7.5Z" fill="#ffd54f"/>`,
      "♦": `<rect x="7" y="4" width="1.4" height="36" ${wood}/><path d="M6.6 4.5L7.7 0.4L8.8 4.5Z" ${steel}/>
        <path d="M8.4 5.5L14.5 7.5L8.4 10Z" fill="${c.trim}" ${line}/>`,
      "♣": `<rect x="7.2" y="4" width="1" height="34" ${wood}/><path d="M6 4.6L7.7 0.4L9.4 4.6Z" fill="#9e9e9e" ${line}/>
        <path d="M7.7 36L5.8 40.5H7.7ZM7.7 36L9.6 40.5H7.7Z" fill="${c.trim}" ${line}/>`,
      "♠": `<rect x="7" y="4" width="1.4" height="36" ${wood}/><path d="M7 4L7.7 0.6L8.4 4Z" ${steel}/>
        <path d="M8.4 5.5L13 3.5Q14.4 8 13 12.5L8.4 10.5Z" ${steel}/>`,
    },
  };
  return props[rank][suit];
}

function cardClassicHalf(rank, suit, c) {
  const line = `stroke="${CARD_INK}" stroke-width="0.45" stroke-linejoin="round"`;
  const prop = cardClassicProp(rank, suit, c, line);
  const robe = `<path d="M3 44L5 33Q7 27 14 26L26 26Q33 27 35 33L37 44Z" fill="${c.robe}" ${line}/>
    <path d="M7 37L13 31M6 42L14 35M33 37L27 31M34 42L26 35" stroke="${c.trim}" stroke-width="1.3"/>`;
  const eyes = `<circle cx="18.1" cy="15.6" r="0.6" fill="#111"/><circle cx="21.9" cy="15.6" r="0.6" fill="#111"/>
    <path d="M20 15.8L19.3 18.4L20.5 18.4" fill="none" ${line}/>`;
  if (rank === "K") {
    return `${robe}
      <path d="M14 26L17 44M26 26L23 44" stroke="${CARD_GOLD}" stroke-width="2"/>
      <rect x="17" y="27" width="6" height="17" fill="#fff" ${line}/>
      <circle cx="19" cy="30" r="0.6"/><circle cx="21" cy="34" r="0.6"/><circle cx="19" cy="38" r="0.6"/><circle cx="21" cy="42" r="0.6"/>
      ${prop}
      <circle cx="32" cy="35" r="2" fill="${CARD_SKIN}" ${line}/>
      <rect x="17.5" y="21" width="5" height="5" fill="${CARD_SKIN}"/>
      <path d="M12 26Q20 31 28 26L27 23.8Q20 28.5 13 23.8Z" fill="${CARD_GOLD}" ${line}/>
      <ellipse cx="20" cy="16" rx="5.2" ry="6" fill="${CARD_SKIN}" ${line}/>
      <path d="M14.8 13Q13.6 19 15.2 23L16 14ZM25.2 13Q26.4 19 24.8 23L24 14Z" fill="${c.hair}"/>
      <path d="M15 18Q15.5 25.5 20 27.5Q24.5 25.5 25 18Q22.5 21.2 20 21.2Q17.5 21.2 15 18Z" fill="${c.hair}" ${line}/>
      <path d="M17 19.6Q20 18.2 23 19.6Q20 20.6 17 19.6Z" fill="${c.hair}" ${line}/>
      ${eyes}
      <path d="M13.5 11L13 4L16 7.5L18 2.5L20 6.5L22 2.5L24 7.5L27 4L26.5 11Z" fill="${CARD_GOLD}" ${line}/>
      <rect x="13.5" y="9.3" width="13" height="2.3" fill="${c.trim}" ${line}/>
      <circle cx="16.5" cy="10.45" r="0.7" fill="#fff"/><circle cx="20" cy="10.45" r="0.7" fill="#fff"/><circle cx="23.5" cy="10.45" r="0.7" fill="#fff"/>`;
  }
  if (rank === "Q") {
    return `<path d="M14 13Q11.5 24 10.5 31L16.5 28Q15 20 16 15ZM26 13Q28.5 24 29.5 31L23.5 28Q25 20 24 15Z" fill="${c.hair}" ${line}/>
      <path d="M4 44L6 34Q8 28 15 27L25 27Q32 28 34 34L36 44Z" fill="${c.robe}" ${line}/>
      <path d="M14 35L26 35L25 44L15 44Z" fill="${c.trim}" ${line}/>
      <path d="M17 35V44M20 35V44M23 35V44" stroke="${CARD_GOLD}" stroke-width="0.8"/>
      <path d="M15 27Q20 34 25 27Z" fill="${CARD_SKIN}" ${line}/>
      <path d="M15.6 28Q20 34.4 24.4 28" fill="none" stroke="${CARD_GOLD}" stroke-width="1"/>
      <circle cx="20" cy="32.6" r="1" fill="${c.trim}" ${line}/>
      <rect x="17.8" y="21" width="4.4" height="6" fill="${CARD_SKIN}"/>
      ${prop}
      <circle cx="31" cy="36" r="2" fill="${CARD_SKIN}" ${line}/>
      <ellipse cx="20" cy="16.5" rx="4.8" ry="5.6" fill="${CARD_SKIN}" ${line}/>
      <path d="M15.2 15Q15 10.6 20 10.6Q25 10.6 24.8 15Q22.5 12.6 20 12.9Q17.5 12.6 15.2 15Z" fill="${c.hair}" ${line}/>
      ${eyes}
      <path d="M18.8 19.6Q20 20.5 21.2 19.6" fill="none" stroke="${CARD_RED}" stroke-width="0.8"/>
      <path d="M15 11L14.5 6L17 8.5L20 4.5L23 8.5L25.5 6L25 11Z" fill="${CARD_GOLD}" ${line}/>
      <circle cx="14.5" cy="5.6" r="0.8" fill="${CARD_GOLD}" ${line}/><circle cx="20" cy="4.2" r="0.8" fill="${CARD_GOLD}" ${line}/><circle cx="25.5" cy="5.6" r="0.8" fill="${CARD_GOLD}" ${line}/>
      <rect x="15" y="9.6" width="10" height="1.8" fill="${c.trim}" ${line}/>`;
  }
  return `${robe}
    <path d="M14 26L20 44L26 26" fill="none" stroke="${CARD_GOLD}" stroke-width="1.8"/>
    ${prop}
    <circle cx="7.7" cy="34" r="2" fill="${CARD_SKIN}" ${line}/>
    <rect x="17.5" y="21" width="5" height="5" fill="${CARD_SKIN}"/>
    <path d="M12 26Q20 30.5 28 26L27 23.8Q20 28 13 23.8Z" fill="${CARD_GOLD}" ${line}/>
    <ellipse cx="20" cy="16.5" rx="5" ry="5.8" fill="${CARD_SKIN}" ${line}/>
    <path d="M15 13Q13.2 18 14.2 22Q15.5 21 16 18ZM25 13Q26.8 18 25.8 22Q24.5 21 24 18Z" fill="${c.hair}" ${line}/>
    ${eyes}
    <path d="M18.6 19.8Q20 20.6 21.4 19.8" fill="none" stroke="${CARD_INK}" stroke-width="0.5"/>
    <path d="M25 8Q30 1.5 35 2.5Q31 4.5 26.5 10Z" fill="#fff" ${line}/>
    <path d="M13.2 12Q12 5.6 20 5.2Q28 5.6 26.8 12Z" fill="${c.trim}" ${line}/>
    <rect x="12.5" y="10.6" width="15" height="2.2" rx="1" fill="${CARD_GOLD}" ${line}/>`;
}

// 16×17 pixel portraits; each letter maps to a colour, "." is empty.
const CARD_PIXEL_ART = {
  K: [
    "...y..y..y..y...",
    "...yy.yyyy.yy...",
    "...yyyyyyyyyy...",
    "...yyryyyyryy...",
    "....hssssssh....",
    "....skssssks....",
    "....ssssssss....",
    "....bssrrssb....",
    "....bbbbbbbb....",
    "...pbbbbbbbbp...",
    "..ppppbbbbpppp..",
    ".ppppyyyyyypppp.",
    ".pqppywwwwyppqp.",
    "ppqpppwkkwpppqpp",
    "pqppppwwwwppppqp",
    "qpppppwkkwpppppq",
    "ppppppwwwwpppppp",
  ],
  Q: [
    "................",
    "......y..y......",
    ".....yyyyyy.....",
    "....hyryyryh....",
    "...hssssssssh...",
    "...hskssssksh...",
    "...hssssssssh...",
    "...hsssrrsssh...",
    "..hhhsssssshhh..",
    "..hhhhyssyhhhh..",
    "..hhppyyyypphh..",
    ".hhppppyypppphh.",
    ".hppqppppppqpph.",
    "ppppqpwwwwpqpppp",
    "pppqppwrrwppqppp",
    "ppqpppwwwwpppqpp",
    "pqppppwrrwppppqp",
  ],
  J: [
    "..........w.....",
    "....qqqqqqqqw...",
    "...qqqqqqqqqqw..",
    "..yyyyyyyyyyyy..",
    "....hssssssh....",
    "....skssssks....",
    "....ssssssss....",
    "....hssrrssh....",
    "....hhsssshh....",
    "......ssss......",
    "...pppyyyyppp...",
    "..ppppyyyypppp..",
    ".pppqppyyppqppp.",
    "pppqpppyypppqppp",
    "ppqppppyyppppqpp",
    "pqpppppyypppppqp",
    "qppppppyyppppppq",
  ],
};

function cardPixelHalf(rank, c) {
  const colors = {
    y: CARD_GOLD, r: CARD_RED, s: CARD_SKIN, k: "#111", w: "#fff",
    h: c.hair, b: c.hair, p: c.robe, q: c.trim,
  };
  const w = 2.5;
  const h = 42 / 17;
  let outline = "";
  let fill = "";
  CARD_PIXEL_ART[rank].forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      outline += `<rect x="${x * w - 0.6}" y="${2 + y * h - 0.6}" width="${w + 1.2}" height="${h + 1.2}"/>`;
      fill += `<rect x="${x * w}" y="${2 + y * h}" width="${w + 0.05}" height="${h + 0.05}" fill="${colors[ch]}"/>`;
    });
  });
  return `<g shape-rendering="crispEdges"><g fill="#111">${outline}</g>${fill}</g>`;
}
