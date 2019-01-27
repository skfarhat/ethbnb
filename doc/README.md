# README

## Server-Client interaction

The server is designed to be another Eth node that reads the state of the blockchain and serves client requests by providing a more convenient and faster API. The server MUST NOT be relied upon for correctness of the data. The client having received a response from the server can verify those results against their local copy of the blockchain. For example, a client making a `GET /listings` call will get a JSON response from the server with all the listings, each listing will have a URL pointing to the image associated with this listing. The image is not stored on the blockchain, its hash is. Therefore, the client **is able** to verify that the image received through the server has a hash matching the image referenced in the blockchain (i.e. the server is no lying, or compromised).

## Dev notes

* Setup `npm install -g ganache-cli`.
* Run `ganache-cli` in terminal or open Ganache mac application for good GUI view.
* Run `truffle migrate --reset` in another.
* Might have to force "npm install web3@0.20.6 --save". Make sure the right version is in use,
otherwise we could get the CORS bug
* Start IPFS desktop.

Running server:

```
cd app/server/
npm run watch-ts
npm run watch-node
```

## Jenkins 

* Start Jenkins: On my mac run `start_jenkins` on the command line
* `JenkinsFile` located in root project defines all build steps
* Require plugins: HTML Report Publisher


## Sublime Setup

* Package eslint-formatter. Use `cmd+K+E` to fix 
* eslint

## DApp

### Setting up IPFS on host system

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

## Sequence Diagrams 

PlantUML: http://plantuml.com/

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
