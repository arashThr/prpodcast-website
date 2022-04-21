#!/bin/sh

set -eu

(command -v node &> /dev/null) || (echo 'Node not found'; exit 1)

DIST_DIR="./dist"
OUT_DIR="./out"
TEMPLATES_DIR="./site/templates"
STATICS_DIR="./site/statics"
GEN_SCRIPT="generate.js"

npx tsc --project tsconfig.json

if [[ $@ > 1 && $1 == 'test' ]]; then
    node out/tests.js
    exit 0
fi

echo 'Copying static files...'
rm -rf $DIST_DIR
cp -a $STATICS_DIR $DIST_DIR

for file in $(cd $TEMPLATES_DIR; find . -type f); do
    dir=$(dirname $file)
    echo "Transform $file"
    [ -d $dir ] || mkdir -p $DIST_DIR/$dir
    node $OUT_DIR/$GEN_SCRIPT $TEMPLATES_DIR/$file $DIST_DIR/$file
done
echo 'Done'

if [[ $@ > 1 && $1 == 'serve' ]]; then
    serve $DIST_DIR
fi
