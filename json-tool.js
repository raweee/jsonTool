
module.exports = function(RED) {
    function JSONTool(config) {
        RED.nodes.createNode(this,config);
        var fetch = require("node-fetch");
        var node = this;
        var msg = {};
        msg.data = null ;
        node.myUrl = config.url;
        node.exampleText = config.exampleText;
        var newArray = [];

        async function getIsData(isCode){
            var jsonArray = await msg.data;
            if (!jsonArray){
                return "Waiting to load json data."
            }
            if(typeof isCode === 'string'){
                isCode = isCode.toLowerCase();

                function objects(obj){
                    return obj['IS TITLE'].toLowerCase().includes(isCode) || obj['FILE'].toLowerCase().includes(isCode);
                };
                
                newArray = jsonArray.filter(objects).slice(0 , 5);
                return newArray;

            } 
            else if (typeof isCode === 'number'){
                return jsonArray[isCode];
            } 
            else {
                node.error("something not correct");
                return;
            }
        }

        node.status({fill:"yellow",shape:"ring",text:"Connecting.."});
        (async ()=> {
            try {
                const response = await fetch(node.myUrl);
                msg.data = await response.json();
                node.status({fill:"green",shape:"ring",text:"Recived"});
            }
            catch(e){
                node.status({fill:"red",shape:"ring",text:"Error"});
                node.error(e)
            };

            async function userFunction (recivedMessage){
                try{
                    msg.data = await msg.data;
                    msg.input = await recivedMessage.payload;
                    msg.payload = recivedMessage.payload;
                    eval(node.exampleText);
                    return msg;
                } 
                catch(e){
                    node.error(e)
                    return;
                }
            };
            
            node.on("input", async (message)=>{
                if (node.exampleText){
                    msg = await userFunction(message);
                    node.send(msg);
                } else {
                    if(message.payload){
                        msg.payload = await getIsData(message.payload)
                        node.send(msg);
                    };
                };
            });

        })();
    }
    RED.nodes.registerType("json-tool", JSONTool);
}
