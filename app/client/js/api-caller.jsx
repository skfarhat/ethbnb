class EthButton extends React.Component {
  render(props) {
    var props = this.props
    return (
        <button onClick={() => props.handleClick(props.parent)}> {props.name} </button> 
      )
  }
}

class APICaller extends React.Component {
        constructor(props) {
            super(props)
            this.state = { 
              error: null, 
              errorInfo: null, 
              selectedClient: 0
            };
        }
        componentDidCatch(error, errorInfo) {
            // Catch errors in any components below and re-render with error message
            this.setState({
                error: error,
                errorInfo: errorInfo
            })
            // You can also log error messages to an error reporting service here
        }
        async hasAccount(self) {
          console.log("hasAccount", self)
          var state = self.state
          var eth = self.props.ctxt
          var clientId = parseInt(state.selectedClient)
          var account = eth.web3.eth.accounts[clientId]
          var res = await eth.contractInstance.hasAccount({
            from: account, 
            gas:100000
          })
          console.log("Client ", clientId, " has account:", res)
        }
        async createAccount(self) {
          console.log("createAccount", self)
          var state = self.state
          var eth = self.props.ctxt
          var clientId = parseInt(state.selectedClient)
          var inputName = state.accountNameIn
          var account = eth.web3.eth.accounts[clientId]

          var res = await eth.contractInstance.createAccount(inputName, {
            from: account, gas:100000
          })
          console.log("CreateAccount result", res)
        }
        // Called when the select (dropdown) changes. 
        // It updates state.selectedClient which is a string. 
        clientSelectChanged(evt) {
          this.state.selectedClient = evt.target.value
        }
        // Called when the input field for account name changes. 
        // It will update state.accountNameIn without triggering an update to UI (it doesn't call setState())
        updateAccountNameInput(evt) {
          this.state.accountNameIn = evt.target.value
        }
        getContent() {
            console.log("APICaller")

            var optionElements = []
            for (var i = 0; i < this.props.ctxt.num_clients; i++) {
                optionElements.push( 
                    <option value={i}>{i}</option>)
            }
            
            var selectElem = React.createElement(
              "select", 
              { onChange: (evt) => this.clientSelectChanged(evt) } , // props
              [optionElements] // children
            )
            var rest = (
                  <div> 
                      <h2> API </h2>
                      <div>
                          <EthButton name="Has Account" handleClick={this.hasAccount} parent={this}/> 
                          <EthButton name="Create Account" handleClick={this.createAccount} parent={this}/>
                          <input type="text" name="account-name" placeholder="name" onChange={evt => this.updateAccountNameInput(evt)} />
                      </div>
                      <div> 
                          <button> Create Listing </button>
                      </div>
                  </div>
                )
            var div = React.createElement('div', {}, [selectElem, rest])
            return div
        }
        render() {
            content = this.getContent()
            // Error path
            if (this.state.errorInfo) {
              return (<h2>Something went wrong.</h2>);
            }
            return (content)
        }
}