#!/bin/bash
#
#

SCRIPTS_DIR=$(cd $(dirname "$0}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CLIENT_DIR="$ROOT_DIR/app/client"
SERVER_DIR="$ROOT_DIR/app/server"

lintClient() {
  d=$(mktemp -d)
  pushd $CLIENT_DIR
  eslint --config .eslintrc.json --ext .jsx --format html -o $d/eslint-output.html .
  popd
  open $d/eslint-output.html
}

if [ ! -z "$BNB_SOURCED" ]; then
  echo "EthBnB already sourced"
else
  export BNB_SOURCED=1
  export PS1="$PS1🏡 " # Helps indicate if we've already sourced bnb
  alias gothere="cd $ROOT_DIR"
  alias full_setup="node $SERVER_DIR/src/server.js --initTestData=true"
  alias quick_setup="node $SERVER_DIR/src/server.js --initTestData=false"
  alias s1="npm start --prefix $CLIENT_DIR" # Start client
  alias s2="npm start --prefix $SERVER_DIR" # Start server
  alias s9="ganache-cli -e 100000 -m \"eyebrow pluck bonus glove drastic nature chef rent youth dizzy magnet virtual\""
  alias s0=full_setup
  alias q0=quick_setup
fi