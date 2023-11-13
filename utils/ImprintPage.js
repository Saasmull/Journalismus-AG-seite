const CONFIG = require("./config");
const fs = require("fs");

module.exports = class ImprintPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Impressum</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->",fs.readFileSync("templates/imprint.html","utf8"));
        return page;
    }
}