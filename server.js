const CONFIG = require("./utils/config");
const express = require("express");
const app = express();
const sec = require("express-basic-auth");

app.use("/service-worker.js",express.static(__dirname+"/root/service-worker.js"));
app.use("/manifest.json",express.static(__dirname+"/root/manifest.json"));
app.use(sec({
    users:{
        "user_journalismusag":"vD6)1w3Bt*w<"
    },
    challenge:true
}))
app.use("/",express.static(__dirname+"/root"));
app.listen(CONFIG.PORT);