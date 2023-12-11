const fs = require("fs");

const CONFIG = require("./config");

module.exports = class SearchPage{
    constructor(){}
    render(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",
                "<title>Suchen | Journalismus-AG</title><meta name=\"description\" content=\"Durchsuche alle Artikel der Journalismus-AG mit unserer Suchfunktion zu den Themen Politik, Umwelt & etc.\">" + 
                "<link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">")
            .replace("<!--CONTENT-->",fs.readFileSync("templates/search.html","utf8"));
        return page;
    }
}