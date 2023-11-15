const CONFIG = require("./config");
const fs = require("fs");

module.exports = class PrivacyPolicyPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Datenschutzerklärung</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->",fs.readFileSync("templates/privacy-policy.html","utf8"));
        return page;
    }
}