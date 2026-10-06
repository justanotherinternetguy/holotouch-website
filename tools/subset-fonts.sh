#!/bin/sh
# Subsets the three typefaces to the Latin range the site uses and packs them as woff2.
# Fredoka and Figtree are variable fonts: the weight axis is narrowed to the weights in use and
# Fredoka's width axis is pinned to normal. Needs fonttools (pyftsubset) and woff2_compress.
set -eu
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
UNICODES='U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2026,U+20AC,U+00D7,U+2022'

instance() { # in out axes...
    fonttools varLib.instancer -q -o "$2" "$1" "$3" ${4:-}
}
pack() { # in out-basename
    pyftsubset "$1" --output-file="$TMP/$2.ttf" --unicodes="$UNICODES" --layout-features='*' \
        --no-hinting --desubroutinize --name-IDs='*' --drop-tables+=DSIG
    woff2_compress "$TMP/$2.ttf" >/dev/null
    mv "$TMP/$2.woff2" "public/fonts/$2.woff2"
}

instance tools/fonts/Fredoka.ttf "$TMP/Fredoka-i.ttf" wght=500:700 wdth=100
instance tools/fonts/Figtree.ttf "$TMP/Figtree-i.ttf" wght=400:700
pack "$TMP/Fredoka-i.ttf" Fredoka
pack "$TMP/Figtree-i.ttf" Figtree
pack tools/fonts/DMMono-Regular.ttf DMMono-Regular
pack tools/fonts/DMMono-Medium.ttf DMMono-Medium
rm -rf "$TMP"
ls -l public/fonts/*.woff2
