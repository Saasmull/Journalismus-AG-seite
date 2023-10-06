const CONFIG = require("./utils/config");
const express = require("express");
const app = express();
const sec = require("express-basic-auth");
const child_process = require("child_process");

var compileProcess = child_process.exec("node ./compile.js",{
    windowsHide:true
},function(err,stdout,stderr){
    console.log(err,stdout,stderr);
});
compileProcess.on("exit",function(){
    startServer();
})

function startServer(){
    if(CONFIG.LOGIN){
        app.use("/service-worker.js",express.static(__dirname+"/root/service-worker.js"));
        app.use("/manifest.json",express.static(__dirname+"/root/manifest.json"));
        app.use(sec({
            users:{
                "user_journalismusag":"vD6)1w3Bt*w<"
            },
            challenge:true
        })); 
    }
    app.use("/",express.static(__dirname+"/root"));
    var server = app.listen(CONFIG.PORT,function(){
        console.log("Der Server läuft auf Port "+CONFIG.PORT)
    });
    server.on("error",function(err){
        switch(err.code){
            case "EADDRINUSE":
                console.error("\x1b[91m[FEHLER]\x1b[0m",
                    "Die Adresse ist bereits in Nutzung. Wahrscheinlich nutzt ein anderer Prozess den Port "+CONFIG.PORT+".");
                    server.
                break;
            default:
                console.error("\x1b[91m[FEHLER]\x1b[0m",err);
        }
    });
}