const CONFIG = require("./config");

module.exports = class OfflinePage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Offline</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->","<h1 style=\"text-align:center;margin:auto;\">Du bist offline!</h1>");
        return page;
    }
}