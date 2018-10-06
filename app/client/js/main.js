(function() {
    'use strict'
    var Web3 = require('web3')
    // Global variables 
    // ----------------
    const CLIENTS_NB = 3
    const PROVIDER_STR = "http://localhost:8545"
    var web3
    var web3Provider
    var contractInstance
    // Functions
    // ---------
    // Initialise web3 
    // Initialise contract
    async function init() {
        if (typeof web3 !== 'undefined') {
            web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            web3Provider = new Web3.providers.HttpProvider(PROVIDER_STR);
        }
        // create an instance of web3 using the HTTP provider.
        // NOTE in mist web3 is already available, so check first if it's available before instantiating
        web3 = new Web3(web3Provider)

        // Load ABI into contract
        var abiArray = window.abiArray // get it from somewhere
        var MyContract = TruffleContract(abiArray)
        MyContract.setProvider(web3Provider)
        console.log(MyContract)
        contractInstance = await MyContract.deployed()
        // var event = contractInstance.CreateEvent({
        //     x: null
        // }, function(e, v) {
        //     console.log("event watched")
        //     console.log(result)
        // })
    }
    // Set callbacks for button presses
    function setup_button_handlers() {
        $("#button-create-account").click(async function(v) {
            var clientId = parseInt($("input[type=radio]:checked").val())
            var inputName = $("input[name='account-name']").val()
            var account = web3.eth.accounts[clientId]
            console.log(account)
            console.log(inputName)
            console.log("balance: " + web3.eth.getBalance(account))
            var res = await contractInstance.createAccount(inputName, {
                from: account, gas:100000
            })
            console.log(res)
            res = await contractInstance.hasAccount({
                from: account, 
                gas:100000
            })
            console.log("has account: " + res)
            // TODO: get the name parameter from the field
            // TODO: get the id of the selected client 
            // contractInstance.createAccount.call({from: })
            // contract.createAccount.
        })
    }
    // Get all details of client number "id" from the web3 API 
    // and update the DOM to reflect those details.
    function update_client_div(id) {
        var account_id = web3.eth.accounts[id]
        $(".client-div[data-client-id='" + id + "']").each(function() {
            var x = $(this).find("#account_id")
            x.html(account_id)
        })
    }
    // Execute 
    // -------
    init()
    setup_button_handlers()
    for (var i = 0; i < CLIENTS_NB; i++) {
        update_client_div(i)
    }
})()