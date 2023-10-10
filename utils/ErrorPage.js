const CONFIG = require("./config");

module.exports = class ErrorPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->","<title>Error 404</title>")
            .replace("<!--CONTENT-->","<h1 style=\"text-align:center;margin:auto;\">Error 404</h1>" + 
            "<iframe style=\"height:72vh;\" src=\"https://games.crazygames.com/en_US/drift-boss/index.html\"></iframe>");
        return page;
    }
}