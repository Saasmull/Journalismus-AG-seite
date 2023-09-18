const CONFIG = require("./config");

module.exports = class Feed{
    constructor(){
        this.articles = [];
    }
    renderFeed(){
        var xml = "<?xml><rss>\n";
        //
        xml += "</rss>";
    }
}