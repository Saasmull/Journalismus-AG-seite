const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const utils = require("./functions");
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
            "potentialAction":{
                "@type":"SearchAction",
                "target":{
                    "@type":"EntryPoint",
                    "urlTemplate":CONFIG.SITE_ROOT+"/search.html?q={search_term_string}"
                },
                "query-input":"required name=search_term_string"
            },
            "inLanguage":"de-DE",
            "isFamilyFriendly":true,
            "image":CONFIG.LOGO,
            "sameAs":[
                "https://www.instagram.com/journalismus_ag/",
            ],
            "publisher":{
                "@type": "NewsMediaOrganization",
                "@id":CONFIG.SITE_ROOT+"/index.html",
                "name": this.title,
                "url":CONFIG.SITE_ROOT,
                "logo":CONFIG.LOGO,
                "description": this.description
            }
        }
        return jsonLD;
    }
    renderMetaTags(){
        var metaString = "<meta name=\"google-site-verification\" content=\"HFT40NWeuYNZW3VWHz6SN6CtrmF9_Jk05t5OI1lzhGc\" />\n";
        //title
        metaString += "<title>" + utils.rmvEntities(this.title) + "</title>\n";
        metaString += "<meta name=\"title\" content=\"" + utils.rmvEntities(this.title) + "\">\n";
        metaString += "<meta property=\"og:title\" content=\"" + utils.rmvEntities(this.title) + "\">\n";
        //description
        metaString += "<meta name=\"description\" content=\"" + utils.rmvEntities(this.description) + "\">\n";
        metaString += "<meta property=\"og:description\" content=\"" + utils.rmvEntities(this.description) + "\">\n";
        //banner
        //metaString += "<meta property=\"og:image\" content=\"" + this.metadata.banner + "\">";
        //logo
        metaString += "<link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">";
        //json-ld
        metaString += "<script type=\"application/ld+json\">\n";
        metaString += utils.rmvEntities(JSON.stringify(this.renderJsonLd())) + "\n";
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
            .replace("<!--CONTENT-->",fs.readFileSync("templates/homepage-top.html","utf8")+categorySections);
        return page;
    }
}