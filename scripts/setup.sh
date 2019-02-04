#!/bin/bash

# ================================================
# DEFINITIONS
# ================================================
SCRIPTS_DIR=$(cd $(dirname "${BASH_SOURCE[0]}" ) && pwd )
ROOT_DIR=$(cd $SCRIPTS_DIR && cd .. && pwd)
ABI_FILE="$ROOT_DIR/app/loadAbi.js"
DATA_MANAGE="$ROOT_DIR/app/server/src/data_manage.js"
ABI_BUILT="$ROOT_DIR/build/contracts/EthBnB.json"

check_exists() {
  ls "$1"  &> /dev/null 
}

exit_err() {
  echo "$1"
  exit 1
}

# ================================================
# CHECKS
# ================================================
check_exists $DATA_MANAGE || exit_err "❌ Failed to find $DATA_MANAGE"


# ================================================
# CHANGE DIRECTORY
# ================================================
pushd $ROOT_DIR

# ================================================
# COMPILE CONTRACT
# ================================================
echo "Ensure ganache-cli or Ganache is running."
truffle compile

# ================================================
# DEPLOY CONTRACT 
# ================================================
out=$(truffle migrate --reset)
echo "$out"
contractAddress=$(echo "$out" | grep 'EthBnB:' | cut -d ':' -f2)
contractAddress=${contractAddress:1} # because there's one space at the beginning

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
# CLEAR MONGO DATABASE
# ================================================
node $DATA_MANAGE --db_clear=true

# ================================================
# CHANGE DIRECTORY BACK
# ================================================
popd