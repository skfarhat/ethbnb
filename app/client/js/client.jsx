function Client(props) {
    let id = props.client_id
    let account_id = props.clientAddress
    console.log("Client props: ")
    console.log(props)
    return (            
        <div className="col client-div" data-client-id="{id}">
            <h2> Client {id} </h2>
            <input type="radio" name="client" value="{id}" />
            <div>
                <em> Account ID </em> <span id="account_id"> {account_id} </span>
            </div>
        </div>
    )
}
class ClientsManager extends React.Component {
    constructor(props) {
        console.log("ClientsManager: constructor()")
        super(props)
        this.eth = props.ctxt
        this.num_clients = 3
    }
    getClients() {
        console.log("ClientsManager: getClients()")
        let all_clients = []; 
        for (var i = 0; i < this.num_clients; i++) {
            if (Object.keys(this.eth).length != 0) {
                console.log("here")
                var client
                client = <Client key={i} client-id={i} clientAddress={this.eth.accounts[i]} />
                all_clients.push(client)
            }
        }
        return all_clients
    }
    render() {
        console.log("ClientsManager: render")
        return (
            <div id="div-clients">
                <h2> Clients </h2>
                { this.getClients() }
            </div>
        )
    }
}