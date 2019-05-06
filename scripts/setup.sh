#!/bin/bash

# ================================================
# DEFINITIONS
# ================================================
SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
ABI_FILE="$ROOT_DIR/app/loadAbi.js"
ABI_BUILT="$ROOT_DIR/build/contracts/EthBnB.json"


exit_err() {
  echo "$1"
  exit 1
}

# ================================================
# CHANGE DIRECTORY
# ================================================
pushd $ROOT_DIR > /dev/null

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
  contractAddress=$(echo "$out" | grep 'contract address' | tail -n 1 | egrep -p '0x\w+' -o) # for truffle v5
else
  # Assume it is version 4
  contractAddress=$(echo "$out" | grep 'EthBnB:' | cut -d ':' -f2) # for truffle v4
  contractAddress=${contractAddress:1} # because there's one space at the beginning
fi


# ================================================
# UPDATE ABI_FILE
# ================================================
# echo "const x = {" > $ABI_FILE
# echo "contractAddress : '$contractAddress'," >> $ABI_FILE
# echo "jsonInterface : " >> $ABI_FILE
# echo "}" >> $ABI_FILE
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