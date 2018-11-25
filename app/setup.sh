#!/bin/bash

DEST_FILE="./loadAbi.js"

echo "Ensure ganache-cli or Ganache is running."
truffle compile

out=$(truffle migrate --reset)
echo "$out"
contractAddress=$(echo "$out" | grep 'EthBnB:' | cut -d ':' -f2)
contractAddress=${contractAddress:1} # because there's one space at the beginning

echo "const x = {" > $DEST_FILE
echo "contractAddress : '$contractAddress'," >> $DEST_FILE
echo "jsonInterface : " >> $DEST_FILE
cat ../build/contracts/EthBnB.json >> $DEST_FILE
echo "}" >> $DEST_FILE

cat << EOF >> $DEST_FILE

if (typeof window === 'undefined') {
    module.exports = x
} else {
    window.contractDetails = x
}

EOF

echo "Updated $DEST_FILE"