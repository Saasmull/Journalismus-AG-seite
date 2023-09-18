const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const Category = require("./Category");

/**
 * @param {string} path Pfad des Artikels
 * @param {Object} metadata Die Metadaten des Artikels
 * @param {string} content Der Markdowninhalt
 * @param {string} htmlContent Der konvertierte Markdowninhalt
 * @method renderArticlePage Rendert die Artikelseite
 */
module.exports = class Article{
    /**
     * @param {string} path Pfad des Artikels
     */
    constructor(path){
        this.path = path;
        if(fs.existsSync("articles/"+path+"/meta.json")){
            this.metadata = JSON.parse(fs.readFileSync("articles/"+path+"/meta.json","utf-8"));
        }
        if(!this.metadata.banner){
            this.metadata.banner = "/assets/images/default-banner.jpg";
        }
        if(fs.existsSync("articles/"+path+"/index.md")){
            this.content = fs.readFileSync("articles/"+path+"/index.md","utf-8");
            this.htmlContent = marked.parse(this.content);
        }
    }
    renderCard(){
        var card = "<article class=\"card\">\n<a href=\"/article/" + this.path + ".html\">\n";
        card += "<div class=\"banner\" style=\"background-image:url('" + this.metadata.banner + "');\"></div>\n";
        card += "<div class=\"card-content\"><h3>" + this.metadata.title + "</h3>\n";
        card += "<p>" + this.metadata.description + "</p>\n";
        card += "</div></a>\n</article>\n";
        return card;
    }
    /**
     * Rendert die Metatags des Artikels
     * @returns {string} Quellcode der Metatags
     */
    renderMetaTags(){
        var metaString = "";
        //title
        metaString += "<title>" + this.metadata.title + "</title>\n";
        metaString += "<meta name=\"title\" content=\"" + this.metadata.title + "\">\n";
        metaString += "<meta property=\"og:title\" content=\"" + this.metadata.title + "\">\n";
        //description
        metaString += "<meta name=\"description\" content=\"" + this.metadata.description + "\">\n";
        metaString += "<meta property=\"og:description\" content=\"" + this.metadata.description + "\">\n";
        //banner
        metaString += "<meta property=\"og:image\" content=\"" + this.metadata.banner + "\">";
        //json-ld
        var jsonLD = {
            "@context": "http://schema.org",
            "@type": "Article",
            "headline": this.metadata.title,
            "description": this.metadata.description,
            "datePublished": this.metadata.published,
            "thumbnailUrl": this.metadata.banner,
            "image": this.metadata.banner,
            "author":[],
            "keywords": this.metadata.categories
        }
        for(var i = 0;i < this.metadata.authors.length;i++){
            jsonLD.author.push({
                "@type":"Person",
                "name":this.metadata.authors[i]
            });
        }
        metaString += "<script type=\"application/ld+json\">\n";
        metaString += JSON.stringify(jsonLD) + "\n";
        metaString += "</script>\n";
        //stylesheet
        metaString += "<link rel=\"stylesheet\" href=\"/assets/styles/article.css\">";
        metaString += "<script defer src=\"/assets/scripts/audio-player.js\"></script>";
        return metaString;
    }
    /**
     * Rendert die Artikelseite
     * @returns {string} Quellcode der Artikelseite
     */
    renderArticlePage(){
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",this.renderMetaTags())
            .replace("<!--CONTENT-->","<div class=\"banner-image\" style=\"background-image:url('" + this.metadata.banner + "');\"></div><article><h1>" + this.metadata.title + "</h1><div id=\"content\">"+this.htmlContent+"</div></article>");
        return page;
    }
}