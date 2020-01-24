#!/bin/bash

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CONTRACTS_DIR="$ROOT_DIR/truffle"

cd $CONTRACTS_DIR && echo "Starting Smart-Contract tests"
truffle test test/test-ethbnb.js
truffle test test/test-listing-payment.js