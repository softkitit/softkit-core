#!/bin/bash
set -eo pipefail

readonly WORK_DIR=$(mktemp -d)

readonly BASE_APP_NAME="platform"
readonly GENERATED_APP_NAME="invoice"

cd $WORK_DIR
nx npx create-nx-workspace my-workspace --preset=nest
