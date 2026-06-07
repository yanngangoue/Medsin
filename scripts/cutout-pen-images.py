"""Découpe les stylos GLP-1 — fond noir ou clair → PNG transparent."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "images"

# (source jpg, output png, mode, tolerance)
JOBS: list[tuple[str, str, str, int]] = [
    ("glp1-mounjaro-pen.jpg", "glp1-mounjaro-pen.png", "dark", 100),
    # Photo sémaglutide sur fond gris (fichier historique wegovy-pen.jpg)
    ("glp1-wegovy-pen.jpg", "glp1-ozempic-pen.png", "light", 45),
    ("glp1-wegovy-pen.jpg", "glp1-wegovy-pen.png", "light", 45),
]


def color_dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def flood_corners(img: Image.Image, tolerance: int = 90) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seeds: list[tuple[int, int]] = []
    targets: list[tuple[int, int, int]] = []

    for x, y in corners:
        r, g, b, _ = px[x, y]
        seeds.append((x, y))
        targets.append((r, g, b))

    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int, tuple[int, int, int]]] = deque()

    for (x, y), target in zip(seeds, targets):
        q.append((x, y, target))

    while q:
        x, y, target = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        r, g, b, _ = px[x, y]
        if color_dist((r, g, b), target) > tolerance:
            continue
        visited[y][x] = True
        px[x, y] = (r, g, b, 0)
        q.append((x + 1, y, target))
        q.append((x - 1, y, target))
        q.append((x, y + 1, target))
        q.append((x, y - 1, target))

    return rgba


def remove_dark(img: Image.Image, threshold: int = 72) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (r, g, b, 0)
            elif max(r, g, b) - min(r, g, b) < 18 and r < 95:
                px[x, y] = (r, g, b, 0)
    return rgba


def flood_edges(img: Image.Image, tolerance: int = 90) -> Image.Image:
    """Retire le fond connecté aux bords (bois, gris clair, etc.)."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int, tuple[int, int, int]]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            r, g, b, _ = px[x, y]
            q.append((x, y, (r, g, b)))
    for y in range(h):
        for x in (0, w - 1):
            r, g, b, _ = px[x, y]
            q.append((x, y, (r, g, b)))

    while q:
        x, y, target = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        r, g, b, _ = px[x, y]
        if color_dist((r, g, b), target) > tolerance:
            continue
        visited[y][x] = True
        px[x, y] = (r, g, b, 0)
        q.append((x + 1, y, target))
        q.append((x - 1, y, target))
        q.append((x, y + 1, target))
        q.append((x, y - 1, target))

    return rgba


def remove_light_background(img: Image.Image) -> Image.Image:
    """Retire ombre et fond gris/beige résiduels après flood fill."""
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mx = max(r, g, b)
            mn = min(r, g, b)
            sat = mx - mn
            avg = (r + g + b) // 3
            if mx < 80:
                px[x, y] = (r, g, b, 0)
            elif sat < 28 and 95 < avg < 205:
                px[x, y] = (r, g, b, 0)
    return rgba


def trim_alpha(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    return img.crop((x0, y0, x1, y1))


def main() -> None:
    for src_name, out_name, mode, tol in JOBS:
        src = ROOT / src_name
        if not src.exists():
            print(f"skip missing {src_name}")
            continue
        img = Image.open(src)
        if mode == "dark":
            cut = remove_dark(img, threshold=tol)
        else:
            cut = flood_edges(img, tolerance=tol)
            cut = flood_corners(cut, tolerance=tol)
            cut = remove_light_background(cut)
        cut = trim_alpha(cut)
        out = ROOT / out_name
        cut.save(out, "PNG", optimize=True)
        print(f"ok {out_name} {cut.size}")


if __name__ == "__main__":
    main()
