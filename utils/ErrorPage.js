const CONFIG = require("./config");

module.exports = class ErrorPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Error 404</title><link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->","<h1 style=\"text-align:center;margin:auto;\">Error 404</h1>" + 
            "<p style=\"text-align:center;margin:auto;\">Die Seite konnte nicht gefunden werden.</p>");
        return page;
    }
}