#!/bin/bash
set -eo pipefail

trap handle_exit EXIT SIGINT SIGTERM

readonly WORK_DIR=$(mktemp -d)
readonly SCRIPT_DIR=$(dirname "$(realpath "$0")")
readonly FIRST_APP_NAME="platform"
readonly SECOND_APP_NAME="dashboard"
readonly FOLDER="$WORK_DIR/$FIRST_APP_NAME"
readonly LIBS_DIR="$FOLDER/libs/random/src"

if [[ ! "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
    echo "Could not create temp dir"
    exit 1
fi

handle_exit() {
    docker stop testdb &>/dev/null
    docker rm testdb &>/dev/null

    rm -rf "$WORK_DIR"
    echo "Deleted temp working directory $WORK_DIR and removed docker container testdb"
    exit 1
}

. "$SCRIPT_DIR/obj.h"

obj first_app
obj second_app

first_app.port = "3000"
first_app.name = "platform"

second_app.port = "9000"
second_app.name = "dashboard"

kill_process_on_port() {
    local port="${1:-3000}"
    local pid=$(lsof -t -i:"$port" -sTCP:LISTEN)

    if [ -n "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid
    else
        echo "No process found using port $port."
    fi
}

kill_process_on_port() {
    local app_port_function="${1:-"first_app_port"}"
    local port=$($app_port_function)

    local pid=$(lsof -t -i:"$port" -sTCP:LISTEN)
    if [ -n "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid
    else
        echo "No process found using port $port."
    fi
}

set_directories() {
    local app_name_function="${1:-"first_app_name"}"
    local app_name=$($app_name_function)

    MIGRATIONS_DIR="$FOLDER/apps/$app_name/src/app/database/migrations"
    CONTROLLERS_DIR="$FOLDER/apps/$app_name/src/app/controllers"
    ASSETS_DIR="$FOLDER/apps/$app_name/src/app/assets"
}

check_server() {
    local app_name_function="${1:-"first_app_name"}"
    local app_port_function="${2:-"first_app_port"}"
    local app_name=$($app_name_function)
    local port=$($app_port_function)
    local health_endpoint="http://localhost:$port/api/$app_name/health"

    echo "Checking $app_name app server on port $port..."
    until nc -z localhost "$port"; do
        sleep 5
    done

    echo "Port $port for $app_name app is open, checking health endpoint..."
    until [ "$(curl -s -o /dev/null -w '%{http_code}' $health_endpoint)" == "200" ]; do
        echo "Waiting for the $app_name server on port $port to become healthy..."
        sleep 5
    done

    echo "$app_name server on port $port is healthy and ready"
}

start_postgres_in_docker() {
    docker run --name testdb -e POSTGRES_PASSWORD=postgres -p 2221:5432 -d postgres:15.4-alpine || {
        echo "Failed to run PostgreSQL container"
        handle_exit
    }
}

clone_repo() {
    local tag=$1
    npx ts-node libs/resource-plugin/src/generators/boilerplate/utils/cli.ts boilerplate-generator --appFolder "$FOLDER" --companyName "random1" --tag "$tag" --repository "https://github.com/softkitit/softkit-nestjs-boilerplate.git"
    cd "$FOLDER"
}

generate_lib() {
    local name="${1:-random}"
    local import_path="${2:-@test/source}"
    local buildable="${3:-true}"

    npx nx generate @softkit/resource-plugin:lib --name="$name" --linter="eslint" --unitTestRunner="jest" --buildable=$buildable --importPath="$import_path" --languages="en" --lintCommandName=""
}

generate_resource() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local entity_name="${2:-invoice}"
    local group_name="${3:-invoices}"
    local tenant_base_entity="${4:-false}"
    local generate_repository="${5:-true}"
    local generate_service="${6:-true}"
    local generate_controller="${7:-true}"
    local base_path="${8:-api/$app_name}"
    local entity_includes_id_field="${9:-true}"
    local entity_includes_version_field="${10:-true}"

    npx nx generate @softkit/resource-plugin:resource --projectName="$app_name" --entityName="$entity_name" --basePath="$base_path" --groupName="$group_name" --tenantBaseEntity=$tenant_base_entity --generateRepository=$generate_repository --generateService=$generate_service --generateController=$generate_controller --entityIncludesIdField=$entity_includes_id_field --entityIncludesVersionField=$entity_includes_version_field --lintCommandName=""
}

generate_service() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local entity_name="${2:-invoice-new}"
    local group_name="${3:-invoices-new}"
    local repository_name="${4:-invoice-new}"
    local service_name="${5:-invoice-new}"
    local tenant_base_service="${6:-false}"

    npx nx generate @softkit/resource-plugin:service --projectName="$app_name" --serviceName="$service_name" --repositoryName="$repository_name" --entityName="$entity_name" --groupName="$group_name" --tenantBaseService=$tenant_base_service --lintCommandName=""
}

generate_controller() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local controller_name="${3:-invoice-new}"
    local group_name="${4:-invoices-new}"
    local repository_name="${5:-invoice-new}"
    local service_name="${6:-invoice-new}"
    local tenant_base_entity="${7:-false}"
    local base_path="${8:-api/$project_name}"
    local entity_includes_id_field="${9:-true}"
    local entity_includes_version_field="${10:-true}"

    npx nx generate @softkit/resource-plugin:controller --projectName="$app_name" --controllerName="$controller_name" --basePath="$base_path" --serviceName="$service_name" --entityName="$entity_name" --groupName="$group_name" --tenantBaseEntity=$tenant_base_entity --entityIncludesIdField=$entity_includes_id_field --entityIncludesVersionField=$entity_includes_version_field --lintCommandName=""
}

generate_http_client() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local import_path="${2:-@$app_name/client}"
    local directory="${3:-clients}"

    npx nx generate @softkit/resource-plugin:http-client --name="$app_name" --importPath="$import_path" --directory="$directory" --lintCommandName=""
}

generate_app() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local app_port="${2:-9000}"
    local i18n="${3:-true}"

    # Do not pass "lintCommandName" as an empty string. This can lead to unintended behavior and potential bugs.
    npx nx generate @softkit/resource-plugin:app $app_name --languages="en" --i18n=$i18n --appPort=$app_port
}

generate_migrations() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)
    local migration_name="${2:-add-invoice-entities}"

    yarn run migration:generate $app_name $migration_name
    node "$SCRIPT_DIR/test-utils.js" -m "$MIGRATIONS_DIR"
}

generate_client() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)

    npx nx reset
    set +e
    npx nx run $app_name:generate-client
    local status=$?
    set -e

    if [ $status -ne 0 ]; then
        echo "Generation failed, retrying..."
        npx nx reset
        npx nx run $app_name:generate-client
    fi
}

run_migrations() {
    local app_name_function="${1:-first_app_name}"
    local app_name=$($app_name_function)

    export MIGRATION_APP_NAME=$app_name
    yarn run typeorm --dataSource=node_modules/@softkit/typeorm/src/lib/migration/migration-data-source.js migration:run
}

generate_code() {
    local tag=$1

    clone_repo "$tag"
    yarn install

    set_directories
    node "$SCRIPT_DIR/test-utils.js" -a "$ASSETS_DIR"
    run_migrations

    generate_lib
    generate_resource
    generate_http_client

    generate_app
    generate_resource "second_app_name"
}

run_app() {
    local app_name_function="${1:-first_app_name}"
    local app_port_function="${2:-first_app_port}"

    local pid_var_name="${3:-FIRST_APP_PID}"
    local development="${4:-true}"
    local app_name=$($app_name_function)
    local port=$($app_port_function)

    kill_process_on_port $port
    if [ "$development" = true ]; then
        export NESTJS_PROFILES=local
    else
        unset NESTJS_PROFILES
    fi

    npx nx run $app_name:serve &
    eval "$pid_var_name=$!"
    check_server $port $app_name
}

test_uppercase_endpoint() {
    local app_name_function="${1:-first_app_name}"
    local app_port_function="${2:-first_app_port}"
    local base_path="${3:-api/$app_name/v1}"
    local entity_name="${4:-invoice}"

    local app_name=$($app_name_function)
    local port=$($app_port_function)
    local route="${entity_name}/uppercase"
    local url="http://localhost:${port}/$base_path/$route"

    echo "Testing endpoint: $url"
    local response=$(curl "$url")

    echo "$response" | grep -q '"TEST STRING"'
    if [ $? -eq 0 ]; then
        echo "Test for $url Passed. Response: $response'"
        trap - EXIT
        pkill -f "nx run"
        handle_exit
        exit 0
    else
        echo "Test for $url Failed: Response does not contain 'TEST STRING'"
    fi
}

run_tests() {
    set_directories
    node "$SCRIPT_DIR/test-utils.js" -c "$CONTROLLERS_DIR" -l "$LIBS_DIR" -a "$ASSETS_DIR"

    generate_client

    generate_resource $FIRST_APP_NAME "invoice-new" "invoices-new" false true false false
    generate_service
    generate_controller

    generate_migrations

    set_directories "$SECOND_APP_NAME"
    node "$SCRIPT_DIR/test-utils.js" -c "$CONTROLLERS_DIR" -a "$ASSETS_DIR"

    # npx nx run platform:test --all --codeCoverage --skip-nx-cache --parallel=false

    run_app
    run_app "second_app_name" "second_app_port" "SECOND_APP_PID" false

    test_uppercase_endpoint
}

main() {
    local tag="${1:-latest}"

    start_postgres_in_docker
    generate_code "$tag"
    run_tests
}

main "$@"
