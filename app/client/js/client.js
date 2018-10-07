function Client(props) {
    let id = props.client_id
    return (            
        <div className="col client-div" data-client-id="{id}">
            <h2> Client {id} </h2>
            <input type="radio" name="client" value="{id}" />
            <div>
                <em> Account ID </em> <span id="account_id">  </span>
            </div>
        </div>
    )
}

class ClientsManager extends React.Component {
    constructor(props) {
        super(props)
        this.num_clients = 3
    }
    getClients() {
        let all_clients = []; 
        for (var i = 0; i < this.num_clients; i++) {
            all_clients.push(<Client key={i} client-id={i} />)
        }
        return all_clients
    }
    render() {
        return (
            <div id="div-clients">
                <h2> Clients </h2>
                { this.getClients() }
            </div>
        )
    }
}

ReactDOM.render(
    <ClientsManager />,
    document.getElementById('clients-container')
)