#!/bin/bash
set -euo pipefail


trap handle_exit EXIT SIGINT SIGTERM

readonly WORK_DIR=$(mktemp -d)
readonly SCRIPT_DIR=$(dirname "$(realpath "$0")")
readonly APP_FOLDER="platform"
readonly FOLDER="$WORK_DIR/$APP_FOLDER"
readonly LIBS_DIR="$FOLDER/libs/random/src"

if [[ ! "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
    echo "Could not create temp dir"
    exit 1
fi

handle_exit() {      
    rm -rf "$WORK_DIR"
    docker stop testdb &> /dev/null
    docker rm testdb &> /dev/null
    echo "Deleted temp working directory $WORK_DIR and removed docker container testdb"
    exit 1
}

kill_process_on_port() {
    local port=$1
    local pid=$(lsof -t -i:"$port" -sTCP:LISTEN)
    if [ -n "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid
    fi
}

set_directories() {
    MIGRATIONS_DIR="$FOLDER/apps/$1/src/app/database/migrations"
    CONTROLLERS_DIR="$FOLDER/apps/$1/src/app/controllers"
    ASSETS_DIR="$FOLDER/apps/$1/src/app/assets"
}

check_server() {
    local port=$1
    echo "Checking server on port $port..."
    until nc -z localhost "$port"; do   
        sleep 1
    done
    echo "Server on port $port is ready"
}

start_docker() {
    docker pull postgres:15.4-alpine || { echo "Failed to pull PostgreSQL image"; handle_exit;  }
    docker run --name testdb -e POSTGRES_PASSWORD=postgres -p 2221:5432 -d postgres || { echo "Failed to run PostgreSQL container"; handle_exit;  }
}

generate_code() {
    npx ts-node libs/resource-plugin/src/generators/boilerplate/utils/cli.ts boilerplate-generator --appFolder "$FOLDER" --companyName "random1" --tag "0.0.1" --repository "https://github.com/softkitit/softkit-nestjs-boilerplate.git"
    cd "$FOLDER"
    yarn install
    sleep 1

    npx nx generate @softkit/resource-plugin:lib --name="random"  --linter="eslint" --unitTestRunner="jest" --buildable=true --importPath="@test/source" --languages="en"
    npx nx generate @softkit/resource-plugin:resource --projectName="platform" --entityName="invoice" --basePath="api/platform" --groupName="invoices" --tenantBaseEntity=false --generateRepository=true --generateService=true --generateController=true --entityIncludesIdField=true --entityIncludesVersionField=true
    npx nx generate @softkit/resource-plugin:http-client --name="platform" --importPath="@platform/client" --directory="clients"

    npx nx generate @softkit/resource-plugin:app dashboard --languages="en"
    npx nx generate @softkit/resource-plugin:resource --projectName="dashboard" --entityName="invoice" --basePath="api/platform" --groupName="invoices" --tenantBaseEntity=false --generateRepository=true --generateService=true --generateController=true --entityIncludesIdField=true --entityIncludesVersionField=true
}

run_tests() {
    set_directories "platform"
    node "$SCRIPT_DIR/test-utils.js" -c "$CONTROLLERS_DIR" -l "$LIBS_DIR" -a "$ASSETS_DIR"

    kill_process_on_port 3000
    npx nx run platform:serve &
    PLATFORM_PID=$!
    check_server 3000
    sleep 1

    npx nx reset
    yarn nx run platform:generate-client

    npx nx generate @softkit/resource-plugin:resource --projectName="platform" --entityName="invoice-new" --basePath="api/platform" --groupName="invoices-new" --tenantBaseEntity=false --generateRepository=true --generateService=false --generateController=false --entityIncludesIdField=true --entityIncludesVersionField=true
    npx nx generate @softkit/resource-plugin:service --projectName="platform" --serviceName="invoice-new" --repositoryName="invoice-new" --entityName="invoice-new" --groupName="invoices-new" --tenantBaseService=false
    npx nx generate @softkit/resource-plugin:controller --projectName="platform" --controllerName="invoice-new" --basePath="api/platform" --serviceName="invoice-new" --entityName="invoice-new" --groupName="invoices-new" --tenantBaseEntity=false --entityIncludesIdField=true --entityIncludesVersionField=true
    yarn run migration:generate platform add-invoice-entities
    node "$SCRIPT_DIR/test-utils.js" -m "$MIGRATIONS_DIR" -c "$CONTROLLERS_DIR"

    set_directories "dashboard"
    node "$SCRIPT_DIR/test-utils.js" -c "$CONTROLLERS_DIR" -a "$ASSETS_DIR"

    kill_process_on_port 9000
    npx nx run dashboard:serve &
    DASHBOARD_PID=$!

    check_server 9000
    npx nx reset
    yarn nx run dashboard:generate-client
    check_server 3000

    response=$(curl -s http://localhost:9000/api/dashboard/v1/invoice/uppercase)

    echo "$response" | grep -q '"TEST STRING"'
    if [ $? -eq 0 ]; then
        echo "Test for invoice/uppercase endpoint Passed. Response: $response'"
        else
        echo "Test for invoice/uppercase endpoint Failed: Response does not contain 'TEST STRING'"
    fi


    new_response=$(curl http://localhost:3000/api/platform/v1/invoice-new)
    if echo "$new_response" | grep -q '"totalItems":0'; then
        echo "Test for invoice-new endpoint Passed: Response: $new_response"
        else
        echo "Test for invoice-new endpoint Failed. Response: $new_response"
    fi

    npx nx platform:test --all --codeCoverage --skip-nx-cache --parallel=false
}

main() {
    start_docker
    generate_code
    run_tests
}

main "$@"