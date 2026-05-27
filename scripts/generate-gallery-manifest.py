#!/usr/bin/env python3
"""Generate gallery manifest from assets/images/gallery."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / "assets" / "images" / "gallery"
MANIFEST_PATH = GALLERY_DIR / "gallery-manifest.json"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def title_from_filename(name: str) -> str:
    stem = Path(name).stem.replace("-", " ").replace("_", " ").strip()
    return " ".join(part.capitalize() for part in stem.split()) or "Gallery image"


def main() -> None:
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    images = []

    for file_path in sorted(GALLERY_DIR.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        images.append(
            {
                "src": f"assets/images/gallery/{file_path.name}",
                "alt": title_from_filename(file_path.name),
                "caption": title_from_filename(file_path.name),
            }
        )

    with MANIFEST_PATH.open("w", encoding="utf-8") as file:
        json.dump(images, file, indent=2)
        file.write("\n")

    print(f"Wrote {len(images)} gallery image(s) to {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
