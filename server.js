const CONFIG = require("./utils/config");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const sec = require("express-basic-auth");
const child_process = require("child_process");
const si = require("systeminformation");
const v = Math.floor(Math.random()*10)+"."+Math.floor(Math.random()*10)+"."+Math.floor(Math.random()*10);
const pino = require("pino");
const pinoHttp = require("pino-http");
const {up} = require("inquirer/lib/utils/readline");


if(!fs.existsSync("./logs")){
    fs.mkdirSync("./logs");
}
const logger = pino({},"./logs/server.log");
const httpLogger = pinoHttp({
    logger:logger
});

app.use(httpLogger);
app.use(cookieParser({}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

function compile(onlyUpdate){
    return child_process.exec("node ./compile.js"+(onlyUpdate?" --only-update":""),{
        windowsHide:true
    },function(err,stdout,stderr){
        console.log(err,stdout,stderr);
    });
}
var compileProcess = compile();
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
        var sessions = [];
        try{
            sessions = fs.readFileSync(".sessions","utf8").split("\n");
            sessions.shift();
            sessions.pop();
        }catch(e){
            fs.writeFileSync(".sessions","keys\n","utf8");
        }
        app.get("/dbg-api",async function(req,res){
            res.writeHead(200,{
                "Content-Type":"text/event-stream",
                "Cache-Control":"no-cache",
                "Connection":"keep-alive"
            });
            const update = async() => {
                var data = {
                    versions:{
                        node:process.versions.node,
                        jag:v
                    },
                    stats:{
                        platform:process.platform,
                        arch:os.arch(),
                        type:os.type(),
                        uptime:os.uptime(),
                        hostname:os.hostname(),
                        //cpus:os.cpus(),
                        //mem:await si.mem(),
                        cpuLoad:(await si.currentLoad()).currentLoad,
                        memoryTotal:os.totalmem(),
                        memoryFree:os.freemem(),
                        memoryUsage:process.memoryUsage(),
                    }
                };
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            update();
            let intID = 0;
            setTimeout(()=>{
                intID = setInterval(update,1200);
            },200);
            req.on("close",() => {
                clearInterval(intID);
            });
        });
        app.all("/al",function(req,res){
            switch(req.method){
                case "POST":
                    if(req.body.action === "Ausloggen"){
                        if(req.cookies.auth){
                            var i = sessions.indexOf(req.cookies.auth);
                            if(i != -1){
                                sessions.splice(i,1);
                                fs.writeFileSync(".sessions","keys\n"+sessions.join("\n")+"\n","utf8");
                            }
                            res.clearCookie("auth");
                        }
                        res.send(createAuthSite(""));
                    }else if(req.cookies.auth && sessions.includes(req.cookies.auth)){
                        switch(req.body.action){
                            case "StarteNeu":
                                res.end();
                                if(process.env.NODE_APP_INSTANCE !== undefined){
                                    logger.info("Neustart wird durchgeführt. Prozess-ID: "+process.pid);
                                    process.exit(0);
                                }
                                break;
                            case "LeseNutzerRechte":
                                res.json({
                                    dev:true,
                                    admin:true
                                });
                                break;
                            case "LeseLogs":
                                var logs = fs.readFileSync("logs/server.log","utf8");
                                if(logs.includes("\n")){
                                    logs = logs.split("\n").slice(-100).join("\n");
                                }
                                res.send(logs);
                                break;
                            case "LeseConfig":
                                res.json(CONFIG);
                                break;
                            case "LeseArtikelListe":
                                res.json([...fs.readdirSync("articles")]);
                                break;
                            case "LeseArtikelMetadaten":
                                res.json([
                                    JSON.parse(req.body.data),
                                    JSON.parse(fs.readFileSync("articles/"+JSON.parse(req.body.data)+"/meta.json","utf-8"))
                                ]);
                                break;
                            case "LeseArtikelInhalt":
                                res.send(
                                    fs.readFileSync("articles/"+JSON.parse(req.body.data)+"/index.md","utf-8")
                                );
                                break;
                            case "SchreibeArtikelMetadaten":
                                fs.writeFileSync("articles/"+JSON.parse(req.body.data).id+"/meta.json",JSON.stringify(JSON.parse(req.body.data).metadata),"utf-8");
                                res.end();
                                compile(true);
                                break;
                            case "SchreibeArtikelInhalt":
                                fs.writeFileSync("articles/"+JSON.parse(req.body.data).id+"/index.md",JSON.parse(req.body.data).content,"utf-8");
                                res.end();
                                compile(true);
                                break;
                            default:
                                res.send(CONFIG.ADMIN_TEMPLATE);
                                break;
                        }
                    }else if(req.body.action === "Einloggen"){
                        if(req.body.user === "jag" &&
                            crypto.pbkdf2Sync(req.body.password,"jag",1000,64,"sha512")
                            .toString("hex") === "77b6eed9d6ad2cac6abed6b80d750da587e7bddda99461fc5066dd089"+
                            "299803eb0d716e5bcd0e1f3b84b89aba887e9ef8ec07f407211ec2210e6f4561dda72d2"){
                            var cookie = crypto.randomUUID();
                            sessions.push(cookie);
                            fs.writeFileSync(".sessions","keys\n"+sessions.join("\n")+"\n","utf8");
                            res.cookie("auth",cookie);
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
                    if(sessions.includes(req.cookies.auth)){
                        res.send(CONFIG.ADMIN_TEMPLATE);
                    }else{
                        res.send(createAuthSite(""));
                    }
                    break;
            }
        })
    }
    if(CONFIG.LOGIN.ON){
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
    app.use("/",function(err,req,res,next){
        if(err){
            // Handle error
            console.log(err);
            logger.error(err);
        }
        next();
    })
    app.use("/",function(req,res){
        res.status(404).sendFile(__dirname+"/root/error404.html");
    })
    var server = app.listen(CONFIG.PORT,function(){
        var url = new URL(CONFIG.SITE_ROOT);
        if(CONFIG.LOGIN.ON){
            url.username = (CONFIG.LOGIN.USERNAME);
            url.password = (CONFIG.LOGIN.PASSWORD);
        }
        console.log("Der Server läuft auf Port \""+CONFIG.PORT+"\".");
        console.log("URL: "+url.toString());
        logger.info("Der Server läuft auf Port \""+CONFIG.PORT+"\".");
    });
    server.on("error",function(err){
        switch(err.code){
            case "EADDRINUSE":
                console.error("\x1b[91m[FEHLER]\x1b[0m",
                    "Die Adresse ist bereits in Nutzung. Wahrscheinlich nutzt ein anderer Prozess den Port "+CONFIG.PORT+".");
                break;
            default:
                console.error("\x1b[91m[FEHLER]\x1b[0m",err);
        }
    });
}