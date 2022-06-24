#!/usr/bin/env bash

set -eu

(command -v node &> /dev/null) || (echo 'Node not found'; exit 1)

DIST_DIR="./dist"
OUT_DIR="./out"
STATICS_DIR="./site/statics"
GEN_SCRIPT="generate.js"
POSTS_DIR="./site/content"

echo "Transpiling TS files..."
rm -rf $OUT_DIR
npx tsc --project tsconfig.json

if [[ $@ > 1 && $1 == 'test' ]]; then
    node $OUT_DIR/tests.js
    exit 0
fi

rm -rf $DIST_DIR
[[ -f .posts_cache.json ]] && rm .posts_cache.json

function build_pages () {
    echo 'Copying static files...'
    cp -a $STATICS_DIR/. $DIST_DIR/

    for file in $(cd $STATICS_DIR; find . -type f | xargs file | grep ASCII | cut -d':' -f1); do
        echo "Transform page $file"
        node $OUT_DIR/$GEN_SCRIPT page $STATICS_DIR/$file $DIST_DIR
    done
}

function build_posts () {
    echo 'Generating posts...'
    for file in $(cd $POSTS_DIR; find . -type f -name '*.md'); do
        echo "Transform post $file"
        node $OUT_DIR/$GEN_SCRIPT post $POSTS_DIR/$file $DIST_DIR
    done
}

build_posts
build_pages

if [[ $@ > 1 && $1 == 'serve' ]]; then
    npx serve -l 20000 $DIST_DIR &

    while true; do
        sleep 1
        # if [[ -n `find ./site -mtime -2s` ]]; then
        if [[ -n `find ./site -newermt '2 seconds ago'` ]]; then
            echo "Site files changed. Rebuilding ..."
            build_posts
            build_pages
            echo 'Build is done'
            # Since we look back 2 seconds, give it some time to past changes
            sleep 1
        fi
    done
fi
