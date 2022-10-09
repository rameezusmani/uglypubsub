//UglyPubSubClient class represents a single websocket connection
class UglyPubSubClient {
    TAG="UglyPubSubClient";
    constructor(ws){
        this.id=(new Date().getTime()).toString(); //generate unique id for this client
        this.ws=ws; //ws = websocket instance of this connection
        this._wireEvents(); //wire events for the websocket instance
    }

    getId(){
        return this.id;
    }

    close(){
        //close websocket instance
        this.ws.close();
    }

    _send(data){
        //send the object as string on this websocket connection
        this.ws.send(JSON.stringify(data));
    }

    _sendSuccess(requestId,data=null){
        //status=200 means success, requestId=unique id for the request made on this connection
        this._send({status: 200,requestId: requestId,data: data});
    }

    _sendError(requestId,status,msg){
        this._send({status: status,requestId: requestId,msg: msg});
    }

    _isChannelValid(channel){
        //check if channel is a valid string
        //for now we just check that it contains only small letters (a-z) and digits (0-9)
        //we can improve the channel naming in future
        for (let a=0;a<channel.length;a++){
            if (!(channel[a]>='a' && channel[a]<='z')
                && !(channel[a]>='0' && channel[a]<='9')){
                    return false;
                }
        }
        return true;
    }

    _isMessageValid(data){
        //requestId must be present in every message from this websocket
        if (!data.requestId){
            this._sendError("",500,"requestId missing");
            return false;
        }
        let reqId=data.requestId;
        //type and data must be present in every message from this websocket
        if (!data.type){
            this._sendError(reqId,500,"Parameter missing");
            return false;
        }
        //only publish and subscribe are supported as type values
        if (data.type!="publish" && data.type!="subscribe"){
            this._sendError(reqId,500,"Invalid type parameter");
            return false;
        }
        //if type is publish then channel and data must be present in the message
        if (data.type=="publish" && (!data.channel || !data.data)){
            this._sendError(reqId,500,"Parameter missing");
            return false;
        }
        //if type is subscribe then channel must be present in the message
        if (data.type=="subscribe" && !data.channel){
            this._sendError(reqId,500,"Parameter missing");
            return false;
        }
        if (!this._isChannelValid(data.channel)){
            this._sendError(reqId,500,"Invalid channel name");
            return false;
        }
        return true;
    }

    _processMessage(data,isBinary){
        //if message is valid
        if (this._isMessageValid(data)){
            if (data.type=="publish"){
                //if type is publish and we have a registered callback for onPublish
                if (this.onPublish){
                    this.onPublish(this,data.requestId,data.channel,data.data);
                }
            }else if (data.type=="subscribe"){
                //if type is subscribe and we have a registered callback for onSubscribe
                if (this.onSubscribe){
                    this.onSubscribe(this,data.requestId,data.channel);
                }
            }
        }
    }

    _wireEvents(){
        //listen for message event
        this.ws.on('message',(data,isBinary)=>{
            this._writeLog("Message received from client "+this.getId());
            this._writeLog(data);
            this._processMessage(JSON.parse(data),isBinary);   
        });
        //list for close event
        this.ws.on('close',(code,reason)=>{
            this._writeLog("Client "+this.getId()+" closed");
            //if we have a registered callback for onClose
            if (this.onClose){
                this.onClose(this);
            }
        });
    }

    _writeLog(msg){
        console.log(this.TAG+"::"+msg);
    }
}

module.exports = {
    PubSubClient: UglyPubSubClient
}