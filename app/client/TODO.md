# TODO

* Write a sample data file that generates test-data on the blockchain. Eases some of the manual testing required.
* Setup Jenkins for continuous integration - run code lint checks and whatever else can be run. (e.g. smart-contract testing).
* Allow clients to upload photos related to a listing - photos will be stored on another server - but verified thru bchain.
* Figure out why IPFS desktop doesn't show uploaded files.

## TODO LATER

* Move ethereum method calling mechanism from APICaller to somewhere else. Let APICaller worry about the display of the component on the screen.
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
* Ensure no APICommand can be launched when there is no client selected.
* Improve styling of APICommands
* [FIXED BUG]: entering a letter in input field that expects uint crashes the app directly. Shouldn't be like this.
* Continuation: check whether the ipfs.add() of files is really succeeding and persiting the added data.
* Ensure all state changing functions in the smart-contract emit events.
* Display all listings in Listings page with pictures
* Server node should listen to events and updates its data structs to better serve the clients.
i.e. it should be actively listening for new events, not just get the old ones.