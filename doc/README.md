# README

## Dev notes

* Setup `npm install -g ganache-cli`
* Run `ganache-cli` in terminal
* Run `truffle migrate --reset` in another

## Run tests

In terminal 1: `ganache-cli` 
In terminal 2: `truffle test` 


## DApp 

### Running client 

js/main.js depends on loadAbi.js being populated with the correct contract ABI. 

`loadAbi.js` must be manually updated if the contract is changed. To update it: 

```
cd <project-root>/app
./updateAbi.sh
```