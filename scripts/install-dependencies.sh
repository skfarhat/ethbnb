#!/bin/bash

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)

pushd $ROOT_DIR > /dev/null

echo "Installing global dependencies: truffle and ganache-cli"
npm install -g truffle ganache-cli

echo "Installing smart-contract dependencies"
npm install --prefix truffle

echo "Installing backend dependencies"
npm install --prefix backend

echo "Installing frontend dependencies"
npm install --prefix frontend

popd

