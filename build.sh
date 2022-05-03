#!/usr/bin/env bash

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

function build () {
    echo 'Copying static files...'
    rm -rf $DIST_DIR
    cp -a $STATICS_DIR $DIST_DIR

    for file in $(cd $TEMPLATES_DIR; find . -type f); do
        dir=$(dirname $file)
        echo "Transform $file"
        [ -d $dir ] || mkdir -p $DIST_DIR/$dir
        node $OUT_DIR/$GEN_SCRIPT $TEMPLATES_DIR/$file $DIST_DIR/$file
    done
}

build

if [[ $@ > 1 && $1 == 'serve' ]]; then
    serve $DIST_DIR &

    while true; do
        sleep 1
        if [[ -n `find ./site -mtime -2s` ]]; then
            echo "Site files changed. Rebuilding ..."
            build
            echo 'Build is done'
            # Since we look back 2 seconds, give it some time to past changes
            sleep 1
        fi
    done
fi
