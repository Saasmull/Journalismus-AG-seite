const CONFIG = require("./config");
const Category = require("./Category");
const Article = require("./Article");

module.exports = class RssFeed{
    /**
     * Erstellt einen neuen RSS-Feed
     * @param {string} title Der Titel des RSS-Feeds
     * @param {string} link Der Pfad zum RSS-Feed
     * @param {string} description Die Beschreibung des Feed
     */
    constructor(title,link,description){
        this.title = title;
        this.link = link;
        this.description = description;
        this.articles = [];
    }
    /**
     * Rendert einen Artikel als RSS-Feed-Item
     * @param {Article} article Der zu rendernde Artikel
     * @returns {string} Der XML-Code des RSS-Items
     */
    renderItem(article){
        var xml = "<item>\n";
        xml += "<title>" + article.metadata.title + "</title>\n";
        xml += "<link>" + CONFIG.SITE_ROOT + "/article/" + article.path + ".html</link>\n";
        xml += "<description>" + article.metadata.description + "</description>\n";
        xml += "<media:thumbnail url=\"" + article.metadata.banner + "\">\n";
        xml += "</item>";
        return xml;
    }
    /**
     * Rendert den RSS-Feed
     * @returns {string} Der XML-Code des RSS-Feeds
     */
    renderFeed(){
        var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        xml += "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n";
        xml += "<channel>\n";
        xml += "<atom:link href=\"" + CONFIG.SITE_ROOT + "/feed.xml\" rel=\"self\" type=\"application/rss+xml\"/>\n";
        xml += "<title>" + this.title + "</title>\n";
        xml += "<link>" + this.link + "</link>\n";
        xml += "<description>" + this.description + "</description>\n";
        xml += "<language>de-de</language>\n";
        xml += "<copyright>" + CONFIG.SITE_NAME + "</copyright>\n";
        for(var i = 0;i < this.articles.length;i++){
            xml += this.renderItem(this.articles[i]) + "\n";
        }
        xml += "</channel>\n";
        xml += "</rss>";
        return xml;
    }
}