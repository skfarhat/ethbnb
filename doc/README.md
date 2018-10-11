# README

## Dev notes

* Setup `npm install -g ganache-cli`
* Run `ganache-cli` in terminal
* Run `truffle migrate --reset` in another
* Might have to force "npm install web3@0.20.6 --save". Make sure the right version is in use,
otherwise we could get the CORS bug.

## Run tests

In terminal 1: `ganache-cli`
In terminal 2: `truffle test`


## DApp

### Running client


Running babel
`npx babel --watch app/client/js --presets react-app/prod --out-dir .`


js/main.js depends on loadAbi.js being populated with the correct contract ABI.

`loadAbi.js` must be manually updated if the contract is changed. To update it:

```
cd <project-root>/app
./updateAbi.sh
```