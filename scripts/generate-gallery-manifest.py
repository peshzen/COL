#!/usr/bin/env python3
"""Generate gallery manifest from assets/images/gallery.

Usage:
  python scripts/generate-gallery-manifest.py           # one-time generation
  python scripts/generate-gallery-manifest.py --watch   # auto-regenerate on changes
"""
from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / "assets" / "images" / "gallery"
MANIFEST_PATH = GALLERY_DIR / "gallery-manifest.json"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def filename_to_caption(filename: str) -> str:
    """Convert filename to a readable caption.
    
    Examples:
      PHOTO-2023-06-04-14-29-19.jpg -> Photo 2023 06 04 14 29 19
      image-sunset.jpg -> Image Sunset
    """
    # Remove extension
    name_without_ext = Path(filename).stem
    
    # Replace hyphens and underscores with spaces
    caption = name_without_ext.replace("-", " ").replace("_", " ")
    
    # Capitalize each word
    caption = " ".join(word.capitalize() for word in caption.split())
    
    return caption


def build_manifest() -> list[dict[str, str]]:
    images = []
    for file_path in sorted(GALLERY_DIR.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        
        caption = filename_to_caption(file_path.name)
        images.append(
            {
                "src": f"assets/images/gallery/{file_path.name}",
                "alt": caption,
                "caption": caption,
            }
        )
    return images


def write_manifest() -> int:
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    images = build_manifest()
    with MANIFEST_PATH.open("w", encoding="utf-8") as file:
        json.dump(images, file, indent=2)
        file.write("\n")
    print(f"Wrote {len(images)} gallery image(s) to {MANIFEST_PATH.relative_to(ROOT)}")
    return len(images)


def gallery_state_key() -> tuple[tuple[str, int, int], ...]:
    state = []
    for file_path in sorted(GALLERY_DIR.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        stat = file_path.stat()
        state.append((file_path.name, stat.st_mtime_ns, stat.st_size))
    return tuple(state)


def watch(poll_interval: float) -> None:
    print(f"Watching {GALLERY_DIR.relative_to(ROOT)} for image changes...")
    previous_state = gallery_state_key()
    while True:
        time.sleep(poll_interval)
        current_state = gallery_state_key()
        if current_state != previous_state:
            write_manifest()
            previous_state = current_state


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate gallery manifest JSON")
    parser.add_argument("--watch", action="store_true", help="Watch for changes and auto-regenerate")
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Polling interval in seconds when using --watch (default: 1.0)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    write_manifest()
    if args.watch:
        watch(max(args.interval, 0.1))


if __name__ == "__main__":
    main()
