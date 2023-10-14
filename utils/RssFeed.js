const CONFIG = require("./config");
const utils = require("./functions");
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
        var xml = CONFIG.INDENT + "<item>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + CONFIG.INDENT + "<title>" + utils.rmvEntities(article.metadata.title) + "</title>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + CONFIG.INDENT + "<link>" + CONFIG.SITE_ROOT + "/article/" + article.path + ".html</link>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + CONFIG.INDENT + "<description>" + utils.rmvEntities(article.metadata.description) + "</description>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + CONFIG.INDENT + "<media:thumbnail url=\"" + article.metadata.banner + "\">" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "</item>";
        return xml;
    }
    /**
     * Rendert den RSS-Feed
     * @returns {string} Der XML-Code des RSS-Feeds
     */
    renderFeed(){
        var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + CONFIG.BREAK;
        xml += "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<channel>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<atom:link href=\"" + CONFIG.SITE_ROOT + "/feed.xml\" rel=\"self\" type=\"application/rss+xml\"/>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<title>" + this.title + "</title>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<link>" + this.link + "</link>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<description>" + this.description + "</description>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<language>de-de</language>" + CONFIG.BREAK;
        xml += CONFIG.INDENT + "<copyright>" + CONFIG.SITE_NAME + "</copyright>" + CONFIG.BREAK;
        for(var i = 0;i < this.articles.length;i++){
            xml += this.renderItem(this.articles[i]) + "" + CONFIG.BREAK;
        }
        xml += CONFIG.INDENT + "</channel>" + CONFIG.BREAK;
        xml += "</rss>";
        return xml;
    }
}