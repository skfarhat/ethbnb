#!/bin/bash

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)

cd $ROOT_DIR && echo "Starting Smart-Contract tests"
truffle test test/test-ethbnb.js
truffle test test/test-listing-payment.js