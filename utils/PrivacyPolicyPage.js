const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");

module.exports = class PrivacyPolicyPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",
                "<title>Datenschutzerklärung</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">" + 
                "<link rel=\"stylesheet\" href=\"/assets/styles/article.css\">"
            )
            .replace("<!--CONTENT-->","<div id=\"content\">"+marked.parse(fs.readFileSync("templates/privacy-policy.md","utf8"))+"</div>");
        return page;
    }
}