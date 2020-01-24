#!/bin/bash
#

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CONTRACTS_DIR="$ROOT_DIR/truffle"
SMART_CONTRACT_FILE="EthBnB.sol|DateBooker.sol"

pass_commit() {
  echo "✅ Commit approved."
  exit 0
}

fail_commit() {
  echo "Failed smart-contract tests"
  echo "❌ Commit revoked."
  exit 1
}

# If smart-contract is added to commit, test it
if [ $(egrep -c "$SMART_CONTRACT_FILE" <(git diff --cached --name-status)) -ne 0 ]; then
  cd $CONTRACTS_DIR && echo "Starting Smart-Contract tests"
  truffle test test/test-ethbnb.js || fail_commit
  truffle test test/test-listing-payment.js || fail_commit
fi

pass_commit