#!/usr/bin/env bash

set -eu

(command -v node &> /dev/null) || (echo 'Node not found'; exit 1)

DIST_DIR="./dist"
OUT_DIR="./out"
TEMPLATES_DIR="./site/templates"
STATICS_DIR="./site/statics"
GEN_SCRIPT="generate.js"
POSTS_DIR="./site/content"

echo "Transpiling TS files..."
rm -rf $OUT_DIR
rm -rf $DIST_DIR
[[ -f .posts_cache.json ]] && rm .posts_cache.json
npx tsc --project tsconfig.json

if [[ $@ > 1 && $1 == 'test' ]]; then
    node $OUT_DIR/tests.js
    exit 0
fi

function build_pages () {
    echo 'Copying static files...'
    cp -a $STATICS_DIR/ $DIST_DIR/

    for file in $(cd $TEMPLATES_DIR; find . -type f); do
        echo "Transform page $file"
        node $OUT_DIR/$GEN_SCRIPT $TEMPLATES_DIR/$file $DIST_DIR
    done
}

function build_posts () {
    echo 'Generating posts...'
    for file in $(cd $POSTS_DIR; find . -type f); do
        echo "Transform post $file"
        node $OUT_DIR/$GEN_SCRIPT $POSTS_DIR/$file $DIST_DIR
    done
}

build_posts
build_pages

find dist -type f

if [[ $@ > 1 && $1 == 'serve' ]]; then
    serve $DIST_DIR &

    while true; do
        sleep 1
        if [[ -n `find ./site -mtime -2s` ]]; then
            echo "Site files changed. Rebuilding ..."
            build_posts
            build_pages
            echo 'Build is done'
            # Since we look back 2 seconds, give it some time to past changes
            sleep 1
        fi
    done
fi
