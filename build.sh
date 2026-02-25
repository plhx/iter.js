#!/bin/sh

PKG_DIR="."
LIB_NAME="iter"

npx esbuild "${PKG_DIR}/${LIB_NAME}.js" \
    --bundle \
    --minify \
    --target=es2020 \
    --format=iife \
    --outfile="${PKG_DIR}/${LIB_NAME}.min.js"
