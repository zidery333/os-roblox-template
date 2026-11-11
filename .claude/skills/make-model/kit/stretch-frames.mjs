// Stretchable UI pieces (buttons with a ledge, pressed 4 px lower, framed slots, pill bars). Needs @napi-rs/canvas.
// Use: copy it beside your drawing script, then import { C, framed, buttons, bar } from './stretch-frames.mjs'; each returns a canvas to save.
import { createCanvas } from '@napi-rs/canvas';

export const C = {
  ink: '#141418', panel: '#26262E', slot: '#4A4A56', slotDark: '#3A3A44', deep: '#1C1C22',
  gold: '#FFB000', goldLight: '#FFC928', goldDark: '#D99600', lockRing: '#5D5D6A',
  green: '#46C35A', greenDark: '#379A47', low: '#D9822B', white: '#F7F6F1', grey: '#C9CDD2',
};
const O = 12; // dark edge in pixels

function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// A framed piece: dark edge 12, optional 6 px ring, flat fill. `ledge` makes the bottom edge thicker
// (a button's lip); `top` pushes the whole thing down (pressed = top 4, ledge 16). Corners stay in the outer 32 px.
export function framed(w, h, { ring, fill, ledge = 0, top = 0, r = 28 }) {
  const c = createCanvas(w, h), g = c.getContext('2d');
  rr(g, 0, top, w, h - top, r); g.fillStyle = C.ink; g.fill();
  const fh = h - top - O - Math.max(O, ledge), k = ring ? 6 : 0;
  if (ring) { rr(g, O, top + O, w - 2 * O, fh, r - O); g.fillStyle = ring; g.fill(); }
  rr(g, O + k, top + O + k, w - 2 * (O + k), fh - 2 * k, r - O - k); g.fillStyle = fill; g.fill();
  return c;
}

// A button set (128 x 96): plain, pressed, locked, go, go pressed. The colours in C are only a start: swap in the game's own.
export function buttons() {
  const b = (ring, fill, pressed) => framed(128, 96, { ring, fill, ledge: pressed ? 16 : 20, top: pressed ? 4 : 0 });
  return {
    Button: b(C.gold, C.slot), Button_Pressed: b(C.goldDark, C.slotDark, true), Button_Locked: b(C.lockRing, C.slotDark),
    Button_Go: b(C.gold, C.green), Button_Go_Pressed: b(C.goldDark, C.greenDark, true),
  };
}

// A 128 x 64 pill bar (stretches sideways only); `back` leaves off the light strip along the top.
export function bar(fill, back = false) {
  const c = createCanvas(128, 64), g = c.getContext('2d');
  rr(g, 0, 0, 128, 64, 32); g.fillStyle = C.ink; g.fill();
  rr(g, O, O, 128 - 2 * O, 64 - 2 * O, 20); g.fillStyle = fill; g.fill();
  if (!back) { g.save(); rr(g, O, O, 104, 40, 20); g.clip(); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(O, O + 5, 128, 8); g.restore(); }
  return c;
}
