# uglypubsub
A very simple nodejs(and websockets) based in-memory publish/subscribe library.
Subscribers can subscribe to a channel.
Publishers can publish message on a channel and it will be received by all the online subscribers.
This is not a queue based system. If subscriber is not connected at the time message was published then they will never receive the message.
Nothing is persisted on the disk. It is only an in-memory system.

# How to use

### Copy lib folder in your project

## Starting server
const PubSubServer = require("./lib/UglyPubSubServer").PubSubServer;
let server = new PubSubServer(8081);
## Closing server
server.close();

## Subscribing to a channel
const WebSocket = require("ws").WebSocket;
const client = new WebSocket('ws://localhost:8081/');
client.on('open',()=>{
    console.log("opened");
    //channel name can only contain small letters (a-z) and digits (0-9)
    client.send(JSON.stringify({requestId: reqId,type:"subscribe",channel:"testchannel"}));
});

## Receiving a published message
client.on('message',(data)=>{
    console.log(JSON.parse(data));
});

## Publishing a message on a channel
const WebSocket = require("ws").WebSocket;
const client = new WebSocket('ws://localhost:8081/');
client.on('open',()=>{
    console.log("opened");
    //channel name can only contain small letters (a-z) and digits (0-9)
    client.send(JSON.stringify({requestId: "uniqueRequestId",type:"publish",channel:"testchannel",data:{mymessage:"Hello world this is my first published message"}}));
});