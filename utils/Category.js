const fs = require("fs");
const {marked} = require("marked");
const utils = require("./functions");

const CONFIG = require("./config");
const Article = require("./Article");

/**
 * @param {string} path Pfad der Kategorie
 * @param {Article[]} articles Artikel der Kategorie
 */
module.exports = class Category{
    /**
     * Artikelkategorie
     * @param {string} path Pfad der Kategorie
     * @param {Article[]} articles Artikel der Kategorie
     */
    constructor(path){
        this.path = path;
        this.articles = [];
        if(fs.existsSync("categories/"+path+"/meta.json")){
            this.metadata = JSON.parse(fs.readFileSync("categories/"+path+"/meta.json","utf-8"));
        }
        if(!this.metadata.banner){
            this.metadata.banner = "/assets/images/default-banner.jpg";
        }
    }
    /**
     * Fügt der Kategorie einen Artikel hinzu.
     * @param {Article} article 
     */
    registerArticle(article){
        this.articles.push(article);
        this.articles = utils.sortArticles(this.articles);
    }

    /**
     * Generiert den HTML-Code für die Kategorie-Metatags.
     * @returns {string} HTML-Code der Kategorie-Metatags
     */
    renderMetaTags(){
        var metaString = "";
        //title
        metaString += "<title>" + utils.rmvEntities(this.metadata.title) + "</title>\n";
        metaString += "<meta name=\"title\" content=\"" + utils.rmvEntities(this.metadata.title) + "\">\n";
        metaString += "<meta property=\"og:title\" content=\"" + utils.rmvEntities(this.metadata.title) + "\">\n";
        //description
        metaString += "<meta name=\"description\" content=\"" + utils.rmvEntities(this.metadata.description) + "\">\n";
        metaString += "<meta property=\"og:description\" content=\"" + utils.rmvEntities(this.metadata.description) + "\">\n";
        //banner
        metaString += "<meta property=\"og:image\" content=\"" + this.metadata.banner + "\">";
        //logo
        metaString += "<link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">";
        //json-ld
        /*metaString += "<script type=\"application/ld+json\">\n";
        metaString += utils.rmvEntities(JSON.stringify(this.renderJsonLd())) + "\n";
        metaString += "</script>\n";*/
        return metaString;
    }

    /**
     * Generiert den HTML-Code für die Kategorie-Übersicht.
     * @returns {string} HTML-Code der Kategorie-Übersicht
     */
    renderCategorySection(){
        var section = "<section class=\"category\">\n";
        section += "<h2><a href=\"/category/" + this.path + ".html\">" + this.metadata.title + "&nbsp;<i class=\"chevron-right\"></i></a></h2>\n";
        section += "<div class=\"card-container\">\n";
        for(var i = 0;i < Math.min(this.articles.length,10);i++){
            section += this.articles[i].renderCard();
        }
        section += "</div>\n</section>\n";
        return section;
    }

    /**
     * Generiert die HTML-Seite der Kategorie.
     * @returns {string} HTML-Code der Kategorie
     */
    renderCategoryPage(){
        var categoryHead = "<div class=\"category-head\">\n";
        categoryHead += "<div class=\"banner-image\" style=\"background-image:url('" + this.metadata.banner + "');\"></div>\n";
        categoryHead += "<h1>" + this.metadata.title + "</h1>\n";
        categoryHead += "<p style=\"text-align:center;\">" + this.metadata.description + "</p>\n";
        categoryHead += "</div>\n";
        var articleCards = "<div class=\"category-items\">\n";
        for(var i = 0;i < this.articles.length;i++){
            articleCards += this.articles[i].renderCard();
        }
        articleCards += "</div>\n";
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",this.renderMetaTags())
            .replace("<!--CONTENT-->",categoryHead+articleCards);
        return page;
    }
}