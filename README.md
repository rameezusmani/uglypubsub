# uglypubsub
A very simple nodejs(and websockets) based in-memory publish/subscribe library.<br />
Subscribers can subscribe to a channel.<br />
Publishers can publish message on a channel and it will be received by all the online subscribers.<br />
This is not a queue based system. 
If subscriber is not connected at the time message was published then they will never receive the message.<br />
Nothing is persisted on the disk, it is only an in-memory system.<br />

# How to use

### Copy lib folder in your project

## Starting server
```
const PubSubServer = require("./lib/UglyPubSubServer").PubSubServer;<br />
let server = new PubSubServer(8081);
```
## Closing server
```
server.close();
```

## Subscribing to a channel
```
const WebSocket = require("ws").WebSocket;<br />
const client = new WebSocket('ws://localhost:8081/');<br />
client.on('open',()=>{<br />
    console.log("opened");<br />
    //channel name can only contain small letters (a-z) and digits (0-9)<br />
    client.send(JSON.stringify({requestId: reqId,type:"subscribe",channel:"testchannel"}));<br />
});
```

## Receiving a published message
```
client.on('message',(data)=>{<br />
    console.log(JSON.parse(data));<br />
});
```

## Publishing a message on a channel
```
const WebSocket = require("ws").WebSocket;<br />
const client = new WebSocket('ws://localhost:8081/');<br />
client.on('open',()=>{<br />
    console.log("opened");<br />
    //channel name can only contain small letters (a-z) and digits (0-9)<br />
    client.send(JSON.stringify({requestId: "uniqueRequestId",type:"publish",channel:"testchannel",data:{mymessage:"Hello world this is my first published message"}}));<br />
});
```