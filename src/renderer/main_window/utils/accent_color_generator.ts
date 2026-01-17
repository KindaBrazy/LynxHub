const GOLDEN_RATIO_CONJUGATE = 0.61803398875;

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export const getAccentColorAdvanced = (title: string, developerName: string): string => {
  const combinedString = `${title.toLowerCase()}-${developerName.toLowerCase()}`;
  const hash = simpleHash(combinedString);

  const hue = (Math.abs(hash) * GOLDEN_RATIO_CONJUGATE * 360) % 360;

  const saturation = 100;
  const lightness = 60;

  return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`;
};

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (300 <= h && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (c: number) => {
    const hex = Math.round((c + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const getAccentColorAsHex = (title: string, developerName: string): string => {
  const hslString = getAccentColorAdvanced(title, developerName);

  const [h, s, l] = hslString.match(/\d+/g)?.map(Number) ?? [0, 0, 0];

  return hslToHex(h, s, l);
};
