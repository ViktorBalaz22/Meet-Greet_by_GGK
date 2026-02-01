#!/bin/sh
# Copy official Audi Type fonts from Downloads into public/fonts/
# Run from project root: sh scripts/copy-audi-fonts.sh

SOURCE_DIR="$HOME/Downloads/Audi Type"
DEST_DIR="public/fonts"

mkdir -p "$DEST_DIR"
cp "$SOURCE_DIR/auditype_extendednormal.ttf" "$DEST_DIR/AudiType-ExtendedNormal.ttf"
cp "$SOURCE_DIR/auditype_extendedbold.ttf" "$DEST_DIR/AudiType-ExtendedBold.ttf"
echo "Audi fonts copied to $DEST_DIR"
