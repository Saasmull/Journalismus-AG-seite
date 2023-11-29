const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");

module.exports = class ImprintPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",
                "<title>Impressum</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">" + 
                "<link rel=\"stylesheet\" href=\"/assets/styles/article.css\">"
            )
            .replace("<!--CONTENT-->","<div id=\"content\">"+marked.parse(fs.readFileSync("templates/imprint.md","utf8"))+"</div>");
        return page;
    }
}