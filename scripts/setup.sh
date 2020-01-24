#!/bin/bash

# ================================================
# DEFINITIONS
# ================================================
SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
CONTRACTS_DIR="$ROOT_DIR/truffle"
ABI_FILE="$ROOT_DIR/loadAbi.js"
ABI_BUILT="$CONTRACTS_DIR/build/contracts/Ethbnb.json"

exit_err() {
  echo "$1"
  exit 1
}

# ================================================
# CHANGE DIRECTORY
# ================================================
pushd $CONTRACTS_DIR > /dev/null

# ================================================
# COMPILE CONTRACT
# ================================================
echo "Ensure ganache-cli or Ganache is running."
rm -rf build/
truffle compile

# ================================================
# DEPLOY CONTRACT
# ================================================
out=$(truffle migrate --reset)
echo "$out"
if [ `truffle --version 2>&1 | grep -p 'v\d' -o` '==' "v5" ]; then
  contractAddress=$(echo "$out" | grep "'Ethbnb'" -A10 | grep 'contract address' | egrep -p '0x\w+' -o) # for truffle v5
else
  # Assume it is version 4
  contractAddress=$(echo "$out" | grep 'Ethbnb:' | cut -d ':' -f2) # for truffle v4
  contractAddress=${contractAddress:1} # because there's one space at the beginning
fi

# ================================================
# UPDATE ABI_FILE
# ================================================
cat << EOF > $ABI_FILE
const x = {
    contractAddress: '$contractAddress',
    jsonInterface:
EOF
cat $ABI_BUILT >> $ABI_FILE
cat << EOF >> $ABI_FILE
}

if (typeof window === 'undefined') {
    module.exports = x
} else {
    window.contractDetails = x
}

EOF

echo "Updated $ABI_FILE"

# ================================================
# CHANGE DIRECTORY BACK
# ================================================
popd > /dev/null