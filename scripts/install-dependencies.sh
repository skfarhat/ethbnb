#!/bin/bash

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)

pushd $ROOT_DIR > /dev/null

npm install --prefix truffle
npm install --prefix backend
npm install --prefix frontend

popd

