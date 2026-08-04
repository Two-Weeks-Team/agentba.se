#!/usr/bin/env bash
# Rebuild the OG card fonts.
#
# The social card is rasterised at build time by Satori, which inlines whatever
# font it is handed. The full JetBrains Mono is 274 kB per weight; subset to the
# glyphs the card can print it is 6.5 kB. Run this if the card copy ever needs a
# character outside the set below.
#
# Requires: python3 -m pip install fonttools
set -euo pipefail

VERSION="2.304"
URL="https://github.com/JetBrains/JetBrainsMono/releases/download/v${VERSION}/JetBrainsMono-${VERSION}.zip"
CHARS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,·-'

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -sL "$URL" -o "$tmp/jbm.zip"
unzip -o -j "$tmp/jbm.zip" "fonts/ttf/JetBrainsMono-Regular.ttf" "fonts/ttf/JetBrainsMono-Bold.ttf" -d "$tmp"

mkdir -p assets/fonts
for weight in Regular Bold; do
  python3 -m fontTools.subset "$tmp/JetBrainsMono-$weight.ttf" \
    --text="$CHARS" \
    --layout-features='' \
    --no-hinting \
    --desubroutinize \
    --output-file="assets/fonts/JetBrainsMono-$weight.subset.ttf"
done

ls -la assets/fonts/
