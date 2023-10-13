const CONFIG = require("./utils/config");
const fs = require("fs");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const sec = require("express-basic-auth");
const child_process = require("child_process");
const v = Math.floor(Math.random()*10)+"."+Math.floor(Math.random()*10)+"."+Math.floor(Math.random()*10);

app.use(cookieParser({}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

var compileProcess = child_process.exec("node ./compile.js",{
    windowsHide:true
},function(err,stdout,stderr){
    console.log(err,stdout,stderr);
});
compileProcess.on("exit",function(){
    startServer();
})

function createAuthSite(errorMessage){
    return CONFIG.BASIC_TEMPLATE.replace("<!--CONTENT-->",`
    <h1>Login</h1>
    <form method=POST>
        <span>${(errorMessage||"")}</span>
        <label for=user>Nutzername</label><input id=user type=text name=user><br>
        <label for=password>Passwort</label><input id=password type=password name=password><br>
        <input type=submit value=Einloggen name=action>
    </form>`);
}

function startServer(){
    app.use("/",function(req,res,next){
        app.disable("x-powered-by");
        res.setHeader("X-Powered-By","CMS "+CONFIG.SITE_NAME+" "+v);
        next();
    })
    if(CONFIG.ADMIN_BACKEND){
        app.all("/al",function(req,res){
            switch(req.method){
                case "POST":
                    if(req.cookies.auth === "is"){
                        console.log(req.body);
                        switch(req.body.action){
                            case "LeseArtikelListe":
                                res.json([...fs.readdirSync("articles")]);
                                break;
                            case "LeseArtikelMetadaten":
                                res.json([
                                    JSON.parse(req.body.data),
                                    JSON.parse(fs.readFileSync("articles/"+JSON.parse(req.body.data)+"/meta.json","utf-8"))
                                ]);
                                break;
                            default:
                                console.log("A")
                                res.send(CONFIG.ADMIN_TEMPLATE);
                                break;
                        }
                    }else if(req.body.action === "Einloggen"){
                        if(req.body.user === "a" && req.body.password === "a"){
                            res.cookie("auth","is");
                            res.send(CONFIG.ADMIN_TEMPLATE);
                            return;
                        }else{
                            res.send(createAuthSite("Falsche Login-Daten!"));
                        }
                    }else{
                        res.send(createAuthSite(""));
                    }
                    break;
                case "GET":
                default:
                    if(req.cookies.auth === "is"){
                        res.send(CONFIG.ADMIN_TEMPLATE);
                        console.log("B")
                    }else{
                        res.send(createAuthSite(""));
                    }
                    break;
            }
        })
    }
    if(CONFIG.LOGIN.ON && 0){
        app.use("/service-worker.js",express.static(__dirname+"/root/service-worker.js"));
        app.use("/manifest.json",express.static(__dirname+"/root/manifest.json"));
        app.use(sec({
            users:{
                [CONFIG.LOGIN.USERNAME]:CONFIG.LOGIN.PASSWORD
            },
            challenge:true
        })); 
    }
    app.use("/",express.static(__dirname+"/root"));
    var server = app.listen(CONFIG.PORT,function(){
        var url = new URL(CONFIG.SITE_ROOT);
        if(CONFIG.LOGIN.ON){
            url.username = (CONFIG.LOGIN.USERNAME);
            url.password = (CONFIG.LOGIN.PASSWORD);
        }
        console.log("Der Server läuft auf Port \""+CONFIG.PORT+"\".");
        console.log("URL: "+url.toString());
    });
    app.use("/",function(err,req,res,next){
        if(err){
            // Handle error
        }
        next();
    })
    app.use("/",function(req,res){
        res.status(404).sendFile(__dirname+"/root/error404.html");
    })
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