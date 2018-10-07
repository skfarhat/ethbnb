
class App extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <div id="div-top" className="row">
                    <Common />
                </div>
                <div id="div-content" className="row">
                    <div id="clients-container" className="col-8"> 
                        <ClientsManager /> 
                    </div>
                    <div id="api-container" className="col-4">
                        <APICaller />
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