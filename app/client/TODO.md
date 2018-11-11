# TODO

* Ensure no APICommand can be launched when there is no client selected.
* Improve styling of APICommands
* Take care of informing the user when a transaction fails (because of some violation to the smart-contract)
* [BUG]: entering a letter in input field that expects uint crashes the app directly. Shouldn't be like this.
* Make 'log' and constants global (use window)

## TODO LATER

* Allow clients to upload photos related to a listing - photos will be stored on another server - but verified thru bchain.
* Link client wallets to the application.
* Move to web3 v1.0.0 

## LOW PRIORITY

* Consider changing logging library

# DONE

* Fix client addresses not being displayed
* Be able to createListing from a specific client
* Convert numeric inputs from input text fields to BigNumber before passing them to web3 functions.
* Show created listings from a client on the UI
* Adjust smart-contract to emit the right events when new listing is created
* Inform user when request was submitted (on MessageBoard for the time being)
* Adjust App layout. More columns
* Get response for functions getName(), getShortName() on MessageBoard or anywhere else.
* Refactor, create a React component called Table.
* Implement reducer ADD_GAS_USER: Show on the UI, the amount of gas consumed by each client
* Refactor EventListening/EthManager