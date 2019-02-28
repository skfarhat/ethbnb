#!/bin/bash
#
#

SCRIPTS_DIR=$(cd $(dirname "$0}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CLIENT_DIR="$ROOT_DIR/app/client"
SERVER_DIR="$ROOT_DIR/app/server"

lint() {
  d=$(mktemp -d)
  pushd $CLIENT_DIR
  eslint --config .eslintrc.json --ext .jsx --format html -o $d/eslint-output.html .
  popd
  open $d/eslint-output.html
}

if [ ! -z "$BNB_SOURCED" ]; then
  echo "ethbnb already sourced"
else
  export BNB_SOURCED=1
  export PS1="$PS1🏡 " # Helps indicate if we've already sourced bnb
  alias ll="lint"
  alias data="node $SERVER_DIR/src/data_manage.js"
  alias setup='$SCRIPTS_DIR/setup.sh'
  alias gothere="cd $ROOT_DIR"
  alias s0="$SCRIPTS_DIR/setup.sh && node $SERVER_DIR/src/data_manage.js --chain_init=true --metadata_add=true"
  alias s9="ganache-cli -e 10000 -m \"eyebrow pluck bonus glove drastic nature chef rent youth dizzy magnet virtual\""
  alias s99="pkill -f ganache-cli"
  alias s1="npm start --prefix $CLIENT_DIR" # Start client
  alias s2="npm start --prefix $SERVER_DIR" # Start server
fi