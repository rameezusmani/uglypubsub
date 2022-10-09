const PubSubServer = require("./lib/UglyPubSubServer").PubSubServer;
const WebSocket = require("ws").WebSocket;

let server = new PubSubServer(8081);

const client1 = new WebSocket('ws://localhost:8081/');
const client2 = new WebSocket('ws://localhost:8081/');
client1.on('open',()=>{
    console.log("opened");
});
client1.on('message',(data)=>{
    console.log("client received back");
    console.log(JSON.parse(data));
});
setTimeout(()=>{
    let reqId=(new Date().getTime()).toString();
    client1.send(JSON.stringify({requestId: reqId,type:"subscribe",channel:"rameez1"}));
},3000);
setTimeout(()=>{
    let reqId=(new Date().getTime()).toString();
    client1.send(JSON.stringify({requestId: reqId,type:"publish",channel:"rameez1",data:{mymessage:"Hello world"}}));
},5000);
setTimeout(()=>{
    server.close();
},10000);