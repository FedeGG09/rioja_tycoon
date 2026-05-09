from pathlib import Path
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "textures"
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 512

def to_img(arr):
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, mode="RGB")

def noise_grid(size, coarse=64, seed=0):
    rng = np.random.default_rng(seed)
    grid = rng.random((coarse, coarse))
    img = Image.fromarray((grid * 255).astype(np.uint8), mode="L")
    return img.resize((size, size), Image.Resampling.BICUBIC)

def rgb_noise(size, coarse=64, seed=0):
    channels = []
    for i in range(3):
        channels.append(np.array(noise_grid(size, coarse=coarse, seed=seed + i * 17)).astype(np.float32))
    return np.stack(channels, axis=-1)

def blur(img, radius=2):
    return img.filter(ImageFilter.GaussianBlur(radius))

def save(img, name):
    img.save(OUT / name, optimize=True)

def make_arid_ground():
    base = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    base[:] = [158, 128, 90]
    n1 = rgb_noise(SIZE, 70, 1) / 255.0
    n2 = rgb_noise(SIZE, 180, 2) / 255.0
    dunes = np.sin(np.linspace(0, math.pi * 10, SIZE))[None, :] * 0.5 + 0.5
    dunes = np.repeat(dunes, SIZE, axis=0)
    dunes = dunes[..., None]
    base = base * (0.78 + 0.28 * n1) + 32 * (n2 - 0.5)
    base += dunes * np.array([8, 5, 0], dtype=np.float32)
    base[:, :, 0] += np.sin(np.linspace(0, math.pi * 18, SIZE))[None, :] * 4
    img = to_img(base)
    return blur(img, 0.4)

def make_gravel_road():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [78, 74, 70]
    n = rgb_noise(SIZE, 90, 5) / 255.0
    arr = arr * (0.72 + 0.26 * n)
    cracks = np.zeros((SIZE, SIZE), dtype=np.float32)
    for x in range(0, SIZE, 88):
        cracks[:, x:x+2] = 1.0
    for y in range(0, SIZE, 120):
        cracks[y:y+2, :] = 1.0
    cracks = Image.fromarray((cracks * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    cracks = np.array(cracks).astype(np.float32) / 255.0
    arr -= cracks[..., None] * np.array([10, 10, 10], dtype=np.float32)
    stripe = np.zeros((SIZE, SIZE), dtype=np.float32)
    stripe[:, SIZE//2-12:SIZE//2+12] = 1.0
    stripe = Image.fromarray((stripe * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
    stripe = np.array(stripe).astype(np.float32) / 255.0
    arr += stripe[..., None] * np.array([80, 62, 10], dtype=np.float32)
    return to_img(arr)

def make_vineyard():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    soil = np.array([145, 116, 72], dtype=np.float32)
    leaf = np.array([80, 127, 58], dtype=np.float32)
    arr[:] = soil
    for y in range(0, SIZE, 42):
        arr[y:y+20] = arr[y:y+20] * 0.68 + leaf * 0.82
        arr[y+20:y+24] = arr[y+20:y+24] * 0.96
    n = rgb_noise(SIZE, 110, 7) / 255.0
    arr = arr * (0.85 + 0.18 * n)
    path = np.zeros((SIZE, SIZE), dtype=np.float32)
    path[:, SIZE//2-5:SIZE//2+5] = 1.0
    path = Image.fromarray((path * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
    path = np.array(path).astype(np.float32) / 255.0
    arr = arr * (1 - path[..., None]) + np.array([176, 136, 86], dtype=np.float32) * path[..., None]
    return to_img(arr)

def make_concrete():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [155, 158, 160]
    n = rgb_noise(SIZE, 85, 9) / 255.0
    arr = arr * (0.82 + 0.18 * n)
    for y in range(0, SIZE, 128):
        arr[y:y+3] -= 12
    for x in range(0, SIZE, 128):
        arr[:, x:x+3] -= 12
    stains = np.array(noise_grid(SIZE, 25, 13)).astype(np.float32) / 255.0
    stains = Image.fromarray((stains * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
    stains = np.array(stains).astype(np.float32) / 255.0
    arr -= stains[..., None] * np.array([18, 16, 14], dtype=np.float32)
    return to_img(arr)

def make_corrugated_metal():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [118, 120, 125]
    band = (np.sin(np.linspace(0, math.pi * 48, SIZE)) * 10 + 10)[None, :]
    band = np.repeat(band, SIZE, axis=0)
    arr += band[..., None]
    n = rgb_noise(SIZE, 90, 21) / 255.0
    arr = arr * (0.88 + 0.18 * n)
    rust = np.array(noise_grid(SIZE, 45, 24)).astype(np.float32) / 255.0
    rust = Image.fromarray((rust * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    rust = np.array(rust).astype(np.float32) / 255.0
    rust = np.clip(rust * 1.3 - 0.2, 0, 1)
    arr = arr * (1 - rust[..., None] * 0.75) + np.array([148, 86, 42], dtype=np.float32) * rust[..., None] * 0.75
    return to_img(arr)

def make_clay_tiles():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    base = np.array([148, 74, 52], dtype=np.float32)
    arr[:] = base
    for y in range(0, SIZE, 64):
        for x in range(0, SIZE, 96):
            h = min(30, SIZE - y)
            w = min(94, SIZE - x)
            arr[y:y+h, x:x+w] += np.array([20, 7, 5], dtype=np.float32)
            arr[y:y+h, x:x+w] -= np.linspace(0, 11, w)[None, :, None]
    n = rgb_noise(SIZE, 100, 31) / 255.0
    arr = arr * (0.88 + 0.18 * n)
    return to_img(arr)

def make_olive_leaf():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [72, 108, 48]
    n = rgb_noise(SIZE, 90, 41) / 255.0
    arr = arr * (0.72 + 0.32 * n)
    speck = np.array(noise_grid(SIZE, 130, 45)).astype(np.float32) / 255.0
    speck = Image.fromarray((speck * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    speck = np.array(speck).astype(np.float32) / 255.0
    arr += speck[..., None] * np.array([34, 28, 10], dtype=np.float32)
    return to_img(arr)

def make_water():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [40, 100, 142]
    n = rgb_noise(SIZE, 140, 51) / 255.0
    ripples = np.sin(np.linspace(0, math.pi * 42, SIZE))[None, :] * 0.5 + 0.5
    ripples = np.repeat(ripples, SIZE, axis=0)
    arr = arr * (0.8 + 0.18 * n) + ripples[..., None] * np.array([18, 34, 42], dtype=np.float32)
    return to_img(arr)

def make_road_marking():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [0, 0, 0]
    arr[:, SIZE//2-24:SIZE//2-6] = [243, 193, 35]
    arr[:, SIZE//2+6:SIZE//2+24] = [243, 193, 35]
    return to_img(arr)

def make_roof_shadow():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [96, 50, 35]
    shade = np.linspace(0.75, 1.1, SIZE)[None, :]
    arr *= shade[..., None]
    arr = arr + (rgb_noise(SIZE, 100, 61) / 255.0) * 18
    return to_img(arr)

def make_sand():
    arr = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    arr[:] = [184, 160, 106]
    n = rgb_noise(SIZE, 100, 71) / 255.0
    arr = arr * (0.88 + 0.18 * n)
    arr += np.sin(np.linspace(0, math.pi * 20, SIZE))[None, :, None] * 3
    return to_img(arr)

textures = {
    "arid_ground_albedo.png": make_arid_ground(),
    "gravel_road_albedo.png": make_gravel_road(),
    "vineyard_albedo.png": make_vineyard(),
    "concrete_albedo.png": make_concrete(),
    "corrugated_metal_albedo.png": make_corrugated_metal(),
    "clay_tiles_albedo.png": make_clay_tiles(),
    "olive_leaf_albedo.png": make_olive_leaf(),
    "water_albedo.png": make_water(),
    "road_marking.png": make_road_marking(),
    "roof_shadow.png": make_roof_shadow(),
    "sand_albedo.png": make_sand(),
}

for name, img in textures.items():
    save(img, name)

# heightmap / splat map
hm = noise_grid(SIZE, 64, 101)
hm = hm.filter(ImageFilter.GaussianBlur(4))
hm.save(OUT / "heightmap.png", optimize=True)

splat = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(splat)
d.rectangle([0, 0, SIZE, SIZE], fill=(50, 80, 30, 255))
d.rectangle([0, SIZE*0.58, SIZE, SIZE], fill=(120, 90, 50, 255))
d.rectangle([SIZE*0.55, 0, SIZE, SIZE], fill=(90, 120, 60, 255))
splat = splat.filter(ImageFilter.GaussianBlur(14))
splat.save(OUT / "splat_rgba.png", optimize=True)

print("Generated textures:", len(textures) + 2)
