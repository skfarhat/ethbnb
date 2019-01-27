#!/bin/bash 
#
# 
DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
CLIENTDIR="$DIR/app/client"

lint() {
  d=$(mktemp -d)
  pushd $CLIENTDIR
  eslint --config .eslintrc.json --ext .jsx --format html -o $d/eslint-output.html .
  popd
  open $d/eslint-output.html
}

alias ll="lint"