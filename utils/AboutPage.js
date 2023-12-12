const CONFIG = require("./config");
const fs = require("fs");

module.exports = class AboutPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",
                "<title>Über uns</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">" + 
                "<link rel=\"stylesheet\" href=\"/assets/styles/article.css\">"
            )
            .replace("<!--CONTENT-->","<div id=\"content\">"+fs.readFileSync("templates/about.html","utf8")+"</div>");
        return page;
    }
}