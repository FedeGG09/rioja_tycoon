export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hash2D(x: number, z: number, seed = 0) {
  const s = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function valueNoise(x: number, z: number, seed = 0) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;

  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);

  const n00 = hash2D(xi, zi, seed);
  const n10 = hash2D(xi + 1, zi, seed);
  const n01 = hash2D(xi, zi + 1, seed);
  const n11 = hash2D(xi + 1, zi + 1, seed);

  const x1 = lerp(n00, n10, u);
  const x2 = lerp(n01, n11, u);
  return lerp(x1, x2, v);
}

export function fbm(x: number, z: number, seed = 0, octaves = 5) {
  let total = 0;
  let amplitude = 0.55;
  let frequency = 0.03;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    total += valueNoise(x * frequency, z * frequency, seed + i * 17.17) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return total / max;
}

export function ridgedFbm(x: number, z: number, seed = 0, octaves = 4) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 0.02;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(2 * valueNoise(x * frequency, z * frequency, seed + i * 23.31) - 1);
    total += n * n * amplitude;
    max += amplitude;
    amplitude *= 0.53;
    frequency *= 2.15;
  }

  return total / max;
}

export function terrainHeight(x: number, z: number, size: number) {
  const plains = (fbm(x, z, 17, 4) - 0.5) * 2.1;
  const hills = ridgedFbm(x + size * 0.25, z - size * 0.1, 29, 5) * 7.8;
  const secondRidge = ridgedFbm(x - size * 0.32, z + size * 0.24, 41, 4) * 4.8;
  const dune = Math.sin(x * 0.08) * Math.cos(z * 0.07) * 0.75;

  const riverCenter = Math.sin(z * 0.05) * size * 0.18 + Math.cos(z * 0.018) * 2.0;
  const riverDist = Math.abs(x - riverCenter);
  const riverCut = Math.exp(-(riverDist * riverDist) / 24) * 5.5;

  const plateau = Math.exp(-((x + size * 0.18) ** 2 + (z + size * 0.14) ** 2) / (size * size * 0.07)) * 2.2;
  const edgeCliffs = Math.exp(-((x - size * 0.44) ** 2 + (z - size * 0.42) ** 2) / (size * size * 0.06)) * 2.4;

  return plains + hills + secondRidge + dune + plateau + edgeCliffs - riverCut - 1.1;
}

export function terrainColorForHeight(height: number) {
  if (height < -0.8) return [0.39, 0.31, 0.2];
  if (height < 0.5) return [0.51, 0.61, 0.33];
  if (height < 2.8) return [0.42, 0.56, 0.26];
  if (height < 5.6) return [0.52, 0.48, 0.32];
  return [0.73, 0.69, 0.57];
}
