# Ethbnb 🏡⛓

Ethbnb is an Airbnb-like decentralised application (DApp) that runs on the Ethereum blockchain.

Its smart-contract is written in Solidity and the application frontend component in JavaScript.
A backend component written in NodeJS is leveraged to support search and filter operations for listings.

![GitHub Logo](/doc/images/frontend.jpg)

# Installation

Clone project and install dependencies
```bash
git clone https://github.com/skfarhat/ethbnb && cd ethbnb
scripts/install-dependencies.sh
```

Set up [Metamask](https://metamask.io/) on your browser

# Running

Three terminals are needed to run Ethbnb in a dev environment
```bash
# Terminal 1: Set up local blockchain
ganache-cli


# Terminal 2: Deploying smart-contract and running backend

# (a) to initialise the system with data
node start <proj_root>/backend/src/server.js --initTestData=true

# Or (b) start fresh
# node start <proj_root>/backend/src/server.js


# Terminal 3: Run client frontend
npm start --prefix <proj_root>/frontend


# Visit http://localhost:3000/ on your browser
# ...
```

# Test smart-contract

```
# 1. Ensure ganache-cli is running
ganache-cli

# 2. Start tests
<proj_root>/scripts/truffle-test.sh
```