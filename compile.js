const fs = require("fs");
const {marked} = require("marked");

const SITE_NAME = "Blog";
const BASIC_TEMPLATE = fs.readFileSync("templates/basic.html","utf-8").replace("<!--SITENAME-->", SITE_NAME);

function cleanDir(path){
    try{
        fs.rmSync(path,{recursive: true});
    }catch(e){}
    try{
        fs.mkdirSync(path,{recursive: true});
    }catch(e){}
}
function setupRootDir(){
    try{
        fs.rmSync("root/index.html");
    }catch(e){}
    cleanDir("root/author");
    cleanDir("root/article");
    cleanDir("root/assets");
    cleanDir("root/category");
    fs.cpSync("assets/","root/assets/",{recursive:true});
}

class Homepage{
    constructor(){
        this.categories = [];
    }
    addCategory(category){
        this.categories.push(category);
    }
    renderHomepage(){
        var categorySections = "<div id=\"content\" class=\"category-container\">\n";
        for(var i = 0;i < this.categories.length;i++){
            categorySections += this.categories[i].renderCategorySection();
        }
        categorySections += "</div>\n";
        var page = BASIC_TEMPLATE
            .replace("<!--CONTENT-->",categorySections);
        return page;
    }
}
/**
 * @param {string} path Pfad der Kategorie
 * @param {Article[]} articles Artikel der Kategorie
 */
class Category{
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
        section += "<h2>" + this.metadata.title + "</h2>\n";
        section += "<div class=\"card-container\">\n";
        for(var i = 0;i < Math.min(this.articles.length,4);i++){
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
        var page = BASIC_TEMPLATE
            .replace("<!--CONTENT-->",categoryHead+articleCards);
        return page;
    }
}

/**
 * @param {string} path Pfad des Artikels
 * @param {Object} metadata Die Metadaten des Artikels
 * @param {string} content Der Markdowninhalt
 * @param {string} htmlContent Der konvertierte Markdowninhalt
 * @method renderArticlePage Rendert die Artikelseite
 */
class Article{
    /**
     * @param {string} path Pfad des Artikels
     */
    constructor(path){
        this.path = path;
        if(fs.existsSync("articles/"+path+"/meta.json")){
            this.metadata = JSON.parse(fs.readFileSync("articles/"+path+"/meta.json","utf-8"));
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
        var page = BASIC_TEMPLATE
            .replace("<!--METADATA-->",this.renderMetaTags())
            .replace("<!--CONTENT-->","<div class=\"banner-image\" style=\"background-image:url('" + this.metadata.banner + "');\"></div><article><h1>" + this.metadata.title + "</h1><div id=\"content\">"+this.htmlContent+"</div></article>");
        return page;
    }
}

setupRootDir();
/** @type {Homepage} */
var homepage = new Homepage();

/** @type {Category[]} */
var categories = {};
var categoriesDir = fs.readdirSync("categories");

for(var i = 0;i < categoriesDir.length;i++){
    categories[categoriesDir[i]] = new Category(categoriesDir[i]);
}

/** @type {Article[]} */
var articles = [];
var articlesDir = fs.readdirSync("articles");

for(var i = 0;i < articlesDir.length;i++){
    articles.push(new Article(articlesDir[i]));
    for(var j = 0;j < articles[i].metadata.categories.length;j++){
        categories[articles[i].metadata.categories[j]].registerArticle(articles[i]);
    }
    fs.writeFileSync("root/article/"+articles[i].path+".html",articles[i].renderArticlePage(),"utf-8");
}

for(var i = 0;i < categoriesDir.length;i++){
    homepage.addCategory(categories[categoriesDir[i]]);
    fs.writeFileSync("root/category/"+categories[categoriesDir[i]].path+".html",categories[categoriesDir[i]].renderCategoryPage(),"utf-8");
}

fs.writeFileSync("root/index.html",homepage.renderHomepage(),"utf-8");