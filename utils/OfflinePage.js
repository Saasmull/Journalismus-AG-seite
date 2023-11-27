const CONFIG = require("./config");
const fs = require("fs");

module.exports = class OfflinePage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Offline</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->",fs.readFileSync("templates/offline.html","utf8"));
        return page;
    }
}