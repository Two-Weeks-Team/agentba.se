#!/usr/bin/env bash
# Regenerate lib/brand.ts from the logo source.
#
# The mark ships as an inline path rather than an <img>: it has to render in
# the header, in a favicon route and inside Satori for the social card, and a
# single path is the only form all three accept without a second copy.
#
# Requires: imagemagick, potrace
set -euo pipefail

SRC="assets/brand/agentbase-logo-source.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The monogram lives in the top ~58%; below it are the wordmark and tagline.
magick "$SRC" -crop 1254x730+0+0 +repage "$TMP/top.png"
magick "$TMP/top.png" -fuzz 15% -trim +repage assets/brand/agentbase-mark-source.png

# 200% + tol 0.8 keeps the curves faithful at 512 px while staying ~2 kB gzipped.
magick assets/brand/agentbase-mark-source.png \
  -colorspace gray -resize 200% -threshold 55% "$TMP/mark.pbm"
potrace "$TMP/mark.pbm" -s -o "$TMP/mark.svg" \
  --turdsize 12 --alphamax 1.0 --opttolerance 0.8

python3 - "$TMP/mark.svg" <<'PY'
import pathlib, re, sys
s = pathlib.Path(sys.argv[1]).read_text()
# potrace wraps the path across lines; a TS string literal cannot hold those.
d = re.sub(r'\s+', ' ', re.search(r'<path d="(.*?)"', s, re.S).group(1)).strip()
out = pathlib.Path("lib/brand.ts").read_text()
out = re.sub(r'export const MARK_PATH =\n  "(?:.*?)";', f'export const MARK_PATH =\n  "{d}";', out, flags=re.S)
pathlib.Path("lib/brand.ts").write_text(out)
print(f"lib/brand.ts updated — path is {len(d)} chars")
PY
