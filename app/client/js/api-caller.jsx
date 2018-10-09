class APICaller extends React.Component {
            constructor(props) {
            super(props)
            this.state = { error: null, errorInfo: null };
        }
        componentDidCatch(error, errorInfo) {
            // Catch errors in any components below and re-render with error message
            this.setState({
                error: error,
                errorInfo: errorInfo
            })
            // You can also log error messages to an error reporting service here
        }
        getContent() {
            console.log("APICaller")
            console.log(this.props)
            // Get radio buttons 
            var optionElements = []
            for (var i = 0; i < this.props.ctxt.num_clients; i++) {
                optionElements.push( 
                    <option value={i}>{i}</option>)
            }
            var rest = (
                  <div> 
                      <h2> API </h2>
                      <div> 
                          <button id="button-create-account"> Create Account </button> 
                          <input type="text" name="account-name" placeholder="name" />           
                      </div>
                      <div> 
                          <button> Create Listing </button>
                      </div>
                  </div>
                )
            var selectElem = React.createElement('select', {}, optionElements)
            var div = React.createElement('div', {}, [selectElem, rest])
            return div
        }
        render() {
            content = this.getContent()
             if (this.state.errorInfo) {
              // Error path
              return (
                <div>
                <h2>Something went wrong.</h2>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
                </details>
                </div>
                );
              }
            
                return (content)
            }
}