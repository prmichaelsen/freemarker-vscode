#!/usr/bin/env bash

# https://stackoverflow.com/questions/73725613/electron-missing-x-server-or-display
export DISPLAY=192.168.0.5:0.0

export CODE_TESTS_PATH="$(pwd)/integration/out/test"
export CODE_TESTS_WORKSPACE="$(pwd)/integration/testFixture"

node "$(pwd)/integration/out/test/runTest"