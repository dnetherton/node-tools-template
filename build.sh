#!/usr/bin/env bash

set -e

version=$(cat ./.nvmrc)

echo 'Transpiling scripts to ./bin'
npm ci
./node_modules/.bin/babel-node ./node_modules/.bin/webpack --config "./webpack.config.js"
