const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const Category = require("./Category");
const Article = require("./Article");

module.exports = class Author {
    constructor(path) {
        this.path = path;
        this.articles = [];
        if(fs.existsSync("authors/" + path + "/meta.json")) {
            this.metadata = JSON.parse(fs.readFileSync("authors/" + path + "/meta.json","utf-8"));
        }
        if(!this.metadata.banner){
            this.metadata.banner = "/assets/images/default-banner.jpg";
        }
        this.description = "";
        this.htmlDescription = "";
        if(fs.existsSync("authors/" + path + "/index.md")) {
            this.description = fs.readFileSync("authors/" + path + "/index.md","utf-8");
            this.htmlDescription = marked.parse(this.description);
        }
    }
    /**
     * Fügt der Kategorie einen Artikel hinzu.
     * @param {Article} article 
    */
    registerArticle(article) {
        article.registerAuthor(this);
        this.articles.push(article);
    }
    renderAuthorPage(){
        var authorHead = "<div class=\"category-head\">\n";
        authorHead += "<div class=\"banner-image\" style=\"background-image:url('" + this.metadata.banner + "');\"></div>\n";
        authorHead += "<h1><div class=\"profile-image\" style=\"background-image:url('"
            + this.metadata.profile +"');\"></div>" + this.metadata.name + "</h1>\n";
        authorHead += "<button id=\"subscribe\" data-path=\"" + this.path + "\" onclick=\"toggleSub(this);\">Abonnieren</button>\n";
        authorHead += "<div id=\"content\" style=\"margin-bottom:2rem;\">" + this.htmlDescription + "</div>\n";
        authorHead += "</div>\n";
        var articleCards = "<div class=\"category-items\">\n";
        for(var i = 0;i < this.articles.length;i++){
            articleCards += this.articles[i].renderCard();
        }
        articleCards += "</div>\n";
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--METADATA-->",
            "<link rel=\"stylesheet\" href=\"/assets/styles/article.css\">" +
            "<script defer src=\"/assets/scripts/audio-player.js\"></script>")
            .replace("<!--CONTENT-->",authorHead+articleCards);
        return page;
    }
}