To run the following tests, a few manual steps are required (owing to truffle's inflexibility)

Move directory contracts-legacy/ to contracts/

# mv contracts-legacy contracts

Running truffle compile will now compile those contracts as they are under contracts/ directory

`truffle test test-perf`.js should work

