const fs = require("fs");
const {marked} = require("marked");

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
    }
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

    renderCategoryPage(){
        var categoryHead = "<div class=\"category-head\">\n";
        categoryHead += "<div class=\"banner-image\" style=\"background-image:url('" + this.metadata.banner + "');\"></div>\n";
        categoryHead += "<h1>" + this.metadata.title + "</h1>\n";
        categoryHead += "<p>" + this.metadata.description + "</p>\n";
        categoryHead += "</div>\n";
        var articleCards = "<div class=\"category-items\">\n";
        for(var i = 0;i < this.articles.length;i++){
            articleCards += this.articles[i].renderCard();
        }
        articleCards += "</div>\n";
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--CONTENT-->",categoryHead+articleCards);
        return page;
    }
}