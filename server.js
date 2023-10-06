const CONFIG = require("./utils/config");
const express = require("express");
const app = express();
const sec = require("express-basic-auth");

app.use(sec({
    users:{
        "user_journalismusag":"vD6)1w3Bt*w<"
    },
    challenge:true
}))
app.use("/",express.static(__dirname+"/root"));
app.listen(CONFIG.PORT);