// 数据层（jobGraph.js / careerRoutes.js / productRoleModel.js）保存的是深色主题下的品牌色。
// 浅色纸面主题不修改这些数据，只在渲染时把它们转成在浅底上可读的墨色。
//
// 只按 HSL 亮度压暗并不够：黄色、黄绿色这类色相在同样的 HSL 亮度下，实际感知亮度高得多。
// 因此这里统一按相对亮度收敛，保证每个颜色在白底上的对比度都在可读范围内。

const MIN_LIGHTNESS = 0.26;
const MAX_LIGHTNESS = 0.47;
const MAX_SATURATION = 0.72;
const MAX_LUMINANCE = 0.17;
const LIGHTNESS_STEP = 0.015;

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((char) => char + char).join("")
    : value;
  const numeric = Number.parseInt(normalized, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: lightness };

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue;
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
  else if (max === green) hue = ((blue - red) / delta + 2) / 6;
  else hue = ((red - green) / delta + 4) / 6;
  return { h: hue, s: saturation, l: lightness };
}

function hueToChannel(p, q, t) {
  let channel = t;
  if (channel < 0) channel += 1;
  if (channel > 1) channel -= 1;
  if (channel < 1 / 6) return p + (q - p) * 6 * channel;
  if (channel < 1 / 2) return q;
  if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
  return p;
}

function hslToRgb({ h, s, l }) {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hueToChannel(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToChannel(p, q, h) * 255),
    b: Math.round(hueToChannel(p, q, h - 1 / 3) * 255),
  };
}

function relativeLuminance({ r, g, b }) {
  const channel = (value) => {
    const scaled = value / 255;
    return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function toHex({ r, g, b }) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function clampLightness(lightness) {
  return Math.min(Math.max(lightness, MIN_LIGHTNESS), MAX_LIGHTNESS);
}

// 把任意色相压到纸面上可读的墨色。hue 以角度传入，与 HSL 的习惯一致。
export function inkHue(hue, saturation, lightness) {
  const color = {
    h: (((hue % 360) + 360) % 360) / 360,
    s: Math.min(saturation, MAX_SATURATION),
    l: clampLightness(lightness),
  };
  let rgb = hslToRgb(color);
  while (relativeLuminance(rgb) > MAX_LUMINANCE && color.l > 0.06) {
    color.l -= LIGHTNESS_STEP;
    rgb = hslToRgb(color);
  }
  return toHex(rgb);
}

export function ink(hex) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return inkHue(h * 360, s, l);
}

// 同色系的极浅底色，用于芯片、标签和高亮块的背景。
export function wash(hex, alpha = 0.1) {
  const { r, g, b } = hexToRgb(ink(hex));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
