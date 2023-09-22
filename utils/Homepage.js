const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const Category = require("./Category");
const Article = require("./Article");

class HomepageMetadata{
    constructor(title,description){
        this.title = title;
        this.description = description;
        this.categories = [];
        this.articles = [];
        this.authors = [];
    }
    renderJsonLd(){
        var jsonLD = {
            "@context": "http://schema.org",
            "@type":"WebSite",
            "@id":CONFIG.SITE_ROOT,
            "url":CONFIG.SITE_ROOT,
            "name":CONFIG.SITE_NAME,
            "description":CONFIG.DESCRIPTION,
            "publisher":{
                "@type": "NewsMediaOrganization",
                "@id":CONFIG.SITE_ROOT+"/index.html",
                "name": this.title,
                "url":CONFIG.SITE_ROOT,
                "description": this.description
            }
        }
        return jsonLD;
    }
    renderMetaTags(){
        var metaString = "";
        //title
        metaString += "<title>" + this.title + "</title>\n";
        metaString += "<meta name=\"title\" content=\"" + this.title + "\">\n";
        metaString += "<meta property=\"og:title\" content=\"" + this.title + "\">\n";
        //description
        metaString += "<meta name=\"description\" content=\"" + this.description + "\">\n";
        metaString += "<meta property=\"og:description\" content=\"" + this.description + "\">\n";
        //banner
        //metaString += "<meta property=\"og:image\" content=\"" + this.metadata.banner + "\">";
        //json-ld
        metaString += "<script type=\"application/ld+json\">\n";
        metaString += JSON.stringify(this.renderJsonLd()) + "\n";
        metaString += "</script>\n";
        return metaString;
    }
}
/**
 * @param {Category[]} categories Kategorien auf der Homepage
 * @param {Article[]} articles alle Artikel
 */
module.exports = class Homepage{
    /**
     * 
     */
    constructor(){
        this.metaTags = new HomepageMetadata(CONFIG.SITE_NAME,CONFIG.DESCRIPTION);
        this.categories = [];
        this.articles = [];
        this.authors = [];
    }

    addCategory(category){
        this.categories.push(category);
        this.metaTags.categories = this.categories;
    }
    addArticle(article){
        this.articles.push(article);
        this.metaTags.articles = this.articles;
    }
    addAuthor(author){
        this.authors.push(author);
        this.metaTags.authors = this.authors;
    }

    renderHomepage(){
        var categorySections = "<div id=\"content\" class=\"no-select no-drag category-container\">\n";
        for(var i = 0;i < this.categories.length;i++){
            categorySections += this.categories[i].renderCategorySection();
        }
        categorySections += "</div>\n";
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",this.metaTags.renderMetaTags())
            .replace("<!--CONTENT-->",categorySections);
        return page;
    }
}