#!/bin/bash

echo "Ensure ganache-cli is running on another terminal"
truffle compile 
truffle migrate --reset 
./updateAbi.sh
