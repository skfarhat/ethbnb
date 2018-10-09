var Web3 = require('web3')
const PROVIDER_STR = "http://localhost:8545"

class App extends React.Component {
    constructor(props) {
        console.log("App: constructor")
        super(props)
        this.state = {
            num_clients: 3, 
        } 
        this.setupState()
    }
    async setupState() {
        console.log("App: setupState BEGIN")
        await this.setupEth()
        // This will be called after we're done setting up all eth, so we call setState
        // and trigger a redrawing of children 
        this.setState(this.state)
        console.log("App: setupState DONE")
    }
    async setupEth() {
        console.log("App: setupEth")
        var provider
        if (typeof this.web3 !== 'undefined') {
            provider = this.web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            provider = new Web3.providers.HttpProvider(PROVIDER_STR);
        }
        
        // Create an instance of web3 using the HTTP provider.
        // NOTE in mist web3 is already available, so check first if it's available before instantiating
        let web3 = new Web3(provider)

        // Load ABI into contract
        let abiArray = window.abiArray // get it from somewhere
        let MyContract = TruffleContract(abiArray)
        MyContract.setProvider(provider)
        let contractInstance = await MyContract.deployed()
        
        // Set properties on `this.state.eth`
        this.state.web3 = web3
        this.state.accounts = web3.eth.accounts
        this.state.MyContract = MyContract
        this.state.contractInstance = contractInstance
    }
    render() {
        console.log("App: render")
        return (
            <div>
                <div id="div-top" className="row">
                    <Common />
                </div>
                <div id="div-content" className="row">
                    <div id="clients-container" className="col-8"> 
                        <ClientsManager ctxt={this.state}/> 
                    </div>
                    <div id="api-container" className="col-4">
                        <APICaller ctxt={this.state}/>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
)