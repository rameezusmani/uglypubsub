const PubSubClient = require("./UglyPubSubClient").PubSubClient;
const WebSocketServer = require("ws").WebSocketServer;

class UglyPubSubServer {
    TAG="UglyPubSubServer";
    DEFAULT_PORT=8080;
    port=this.DEFAULT_PORT;
    clients=[];
    channels={};
    constructor(port){
        if (port){
            this.port=port;
        }
        this.wss=new WebSocketServer({port: this.port});
        this._wireEvents();
        this._writeLog("Server started on port "+this.port);
    }

    close(){
        //close all the clients in collection
        for (let a=0;a<this.clients.length;a++){
            this.clients[a].close();
        }
        //clear clients
        this.clients=[];
        //close server
        this.wss.close();
        //clear channels
        this.channels={};
    }

    _isSubscribed(client,channel){
        if (!this.channels[channel])
            return false;
        for (let a=0;a<this.channels[channel].subscribers.length;a++){
            if (this.channels[channel].subscribers[a].id==client.id){
                return true;
            }
        }
        return false;
    }

    _subscribe(client,requestId,channel){
        if (!this._isSubscribed(client,channel)){
            if (!this.channels[channel]){
                this.channels[channel]={subscribers:[]};
            }
            this.channels[channel].subscribers.push(client);
        }
        client._sendSuccess(requestId,{type:"subscribe",channel: channel});
    }

    _publish(client,requestId,channel,data){
        //generate a dummy messageId. We can use it for later versions if we need
        //to keep track of the sent messages
        let messageId=(new Date().getTime()).toString();
        if (this.channels[channel]){
            let subscribers=this.channels[channel].subscribers;
            for (let a=0;a<subscribers.length;a++){
                let subscriber=subscribers[a];
                //status=201 means this is a published message on a channel
                //we will return data + other information to the subscriber
                //sending messageId and requestId back to subscriber can help in implementing 
                //the logging feature on client side
                subscriber._send({status:201,messageId: messageId,requestId: requestId,channel: channel,data: data});
            }
        }
        client._sendSuccess(requestId,{type:"publish",channel: channel,messageId: messageId});
    }

    _wireEvents(){
        this.wss.on('connection',(ws)=>{
            this._writeLog("New connection "+ws.url);
            let client=new PubSubClient(ws);
            client.onClose=(client)=>{
                this._writeLog("Client "+client.getId()+" closed");
                this._removeClient(client);
            }
            client.onError=(client,err)=>{
                this._writeLog("Error in client "+client.getId()+" --> "+JSON.stringify(err));
            }
            client.onPublish=(client,requestId,channel,data)=>{
                this._writeLog("Client "+client.getId()+" publishing to channel "+channel);
                //publish
                this._publish(client,requestId,channel,data);
            }
            client.onSubscribe=(client,requestId,channel)=>{
                this._writeLog("Client "+client.getId()+" subscribing to channel "+channel);
                //subscribe
                this._subscribe(client,requestId,channel);
            }
            this.clients.push(client);
        });
    }

    _removeClient(client){
        for (let a=0;a<this.clients.length;a++){
            if (this.clients[a].getId()==client.getId()){
                this.clients.splice(a,0);
                break;
            }
        }
    }

    _writeLog(msg){
        console.log(this.TAG+"::"+msg);
    }
}

module.exports = {
    PubSubServer: UglyPubSubServer
}