# README

## Dev notes

* Setup `npm install -g ganache-cli`
* Run `ganache-cli` in terminal
* Run `truffle migrate --reset` in another
* Might have to force "npm install web3@0.20.6 --save". Make sure the right version is in use,
otherwise we could get the CORS bug.

## DApp

### Setting up IPFS on the host system 

Setup the desktop client (good for visualising files stored on the locally-run daemon). As far as I can see, if IPFS was not installed, IPFS desktop will take care of installing it. 

```
## This is because `brew install openssl` will install but not make available
## the libraries for linkage. 
ln -s /usr/local/opt/openssl/include/openssl /usr/local/include

git clone https://github.com/ipfs-shipyard/ipfs-desktop.git
cd ipfs-desktop
npm install
npm start
```

## Running client

```
cd <project-root>/app/client/

## Run ganache-cli or the Ganache desktop app
## ...

## The below will compile, migrate the contract and create a loadAbi.js file 
## that will be used by the client code
./client_setup.sh

## Start the React client app
npm start 
```

--- 

## Run tests

_These have not been tested recently, `truffle test` might fail_


In terminal 1: `ganache-cli`
In terminal 2: `truffle test`
