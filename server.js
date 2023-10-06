const CONFIG = require("./utils/config");
const express = require("express");
const app = express();
const sec = require("express-secretsite");

app.use(sec({
    password:"test"
}))
app.use("/",express.static(__dirname+"/root"));
app.listen(CONFIG.PORT);