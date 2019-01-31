#!/bin/bash 
#
# 
SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CLIENT_DIR="$ROOT_DIR/app/client"

lint() {
  d=$(mktemp -d)
  pushd $CLIENT_DIR
  eslint --config .eslintrc.json --ext .jsx --format html -o $d/eslint-output.html .
  popd
  open $d/eslint-output.html
}

alias ll="lint"