#!/bin/bash

set -e

docusaurus start apps/docs &

DOCUSAURUS_PID=$!

check_server() {
    local port=$1
    while ! nc -z localhost "$port" ; do   
        sleep 1
    done
}

check_server 3000

find ./apps/docs/docs/api -mindepth 2 -type f -name 'index.md' -exec sed -i '' -E 's/([a-zA-Z]+)\/src/\1/g' {} +

wait $DOCUSAURUS_PID