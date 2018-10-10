#!/bin/bash
# 
# Script MUST be run from app/ directory

DEST_FILE="client/src/loadAbi.js"

echo "window.abiArray = " > $DEST_FILE
cat ../build/contracts/EthBnB.json >> $DEST_FILE
