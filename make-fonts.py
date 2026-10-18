#!/usr/bin/env python3
"""부크크 명조를 '이 앱이 실제로 쓰는 글자'만 남겨 테마 에셋으로 굽는다.
원본 8MB → 수십 KB. 카피(문구·프레임 이름·태그라인)를 바꾸면 다시 실행한다:
    python3 make-fonts.py
원본 폰트가 ~/Library/Fonts 에 설치돼 있어야 한다(부크크 배포본)."""
import pathlib, subprocess, sys

SRC = pathlib.Path.home() / "Library/Fonts"
OUT = pathlib.Path("themes/seemefeel/assets")
WEIGHTS = {"BookkMyungjo_Bold.ttf": "bookk-myungjo-bold.ttf",
           "BookkMyungjo_Light.ttf": "bookk-myungjo-light.ttf"}

# 화면·스트립에 나올 수 있는 모든 글자를 소스에서 긁는다
text = "".join(p.read_text(encoding="utf-8") for p in
               [pathlib.Path("index.html"), pathlib.Path("d.html")] +
               sorted(pathlib.Path("themes").rglob("theme.js")) +
               sorted(pathlib.Path("themes").rglob("theme.css")))
chars = set(text) | set("0123456789.·〈〉…—-()[]{}/:;,!?'\"%&+=@#")
chars |= set(chr(c) for c in range(0x20, 0x7F))          # 라틴·숫자·기호 전부
chars = {c for c in chars if c.isprintable() and c != " "}

for src, dst in WEIGHTS.items():
    if not (SRC / src).exists():
        sys.exit(f"원본 폰트가 없다: {SRC/src}\n부크크에서 받아 설치한 뒤 다시 실행한다.")
    subprocess.run([sys.executable, "-m", "fontTools.subset", str(SRC / src),
                    "--text=" + "".join(sorted(chars)),
                    "--output-file=" + str(OUT / dst),
                    "--layout-features=*", "--no-hinting"], check=True)
    print(f"{src} {(SRC/src).stat().st_size/1e6:.1f}MB → {dst} {(OUT/dst).stat().st_size/1024:.0f}KB "
          f"({len(chars)}자)")
