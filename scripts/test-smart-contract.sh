#!/bin/bash
#

SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
SMART_CONTRACT_FILE="EthBnB.sol|DateBooker.sol"

pass_commit() {
  echo "✅ Commit approved."
  exit 0
}

fail_commit() {
  echo "❌ Commit revoked."
  exit 1
}

# If smart-contract is added to commit, test it
if [ $(egrep -c "$SMART_CONTRACT_FILE" <(git diff --cached --name-status)) -ne 0 ]; then
  cd $ROOT_DIR && echo "Running tests on smart-contract"
  truffle test || echo "Failed smart-contract tests" && fail_commit
fi

pass_commit