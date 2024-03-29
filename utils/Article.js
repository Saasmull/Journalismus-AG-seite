const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const utils = require("./functions");
const Category = require("./Category");
const Author = require("./Author");

/**
 * @param {string} path Pfad des Artikels
 * @param {Author[]} authors Autoren, die den Artikel verfasst haben
 * @param {Boolean} index Ob der Artikel indexiert werden soll
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
        this.authors = [];
        this.index = true;
        if(fs.existsSync("articles/"+path+"/meta.json")){
            this.metadata = JSON.parse(fs.readFileSync("articles/"+path+"/meta.json","utf-8"));
        }
        if(!this.metadata.banner){
            this.metadata.banner = "/assets/images/default-banner-comp.webp";
        }
        if(typeof this.metadata.visible === "string"){
            if(this.metadata.visible === "hidden"){
                this.index = false;
            }
        }
        if(fs.existsSync("articles/"+path+"/index.md")){
            this.content = fs.readFileSync("articles/"+path+"/index.md","utf-8");
            this.htmlContent = marked.parse(this.content);
        }
    }
    /**
     * Registriert einen Autor
     * @param {Author} author 
     */
    registerAuthor(author){
        this.authors.push(author);
    }

    /**
     * Rendert die Karte des Artikels
     * @returns {string} 
     */
    renderCard(){
        var card = "<article class=\"card\">\n<a href=\"/article/" + this.path + ".html\" itemscope itemtype=\"http://schema.org/Article\">\n";
        card += "<div class=\"banner\" data-bg-img=\"" + this.metadata.banner + "\"></div>\n";
        card += "<div class=\"card-content\"><h3 itemprop=\"headline\">" + this.metadata.title + "</h3>\n";
        card += "<p itemprop=\"description\">" + this.metadata.description + "</p>\n";
        card += "<meta itemprop=\"image\" content=\"" + this.metadata.description + "\">\n";
        card += "</div></a>\n</article>\n";
        return card;
    }
    /**
     * Rendert die Metatags des Artikels
     * @param {Boolean} preview Ob die Seite im Vorschaumodus gerendert werden soll
     * @returns {string} Quellcode der Metatags
     */
    renderMetaTags(preview = false){
        var metaString = "";
        //url
        metaString += "<meta property=\"og:url\" content=\"" + CONFIG.SITE_ROOT + "/article/" + this.path + ".html\">\n";
        //title
        metaString += "<title>" + utils.rmvEntities(this.metadata.title) + "</title>\n";
        metaString += "<meta name=\"title\" content=\"" + utils.rmvEntities(this.metadata.title) + "\">\n";
        metaString += "<meta property=\"og:title\" content=\"" + utils.rmvEntities(this.metadata.title) + "\">\n";
        //description
        metaString += "<meta name=\"description\" content=\"" + utils.rmvEntities(this.metadata.description) + "\">\n";
        metaString += "<meta property=\"og:description\" content=\"" + utils.rmvEntities(this.metadata.description) + "\">\n";
        //banner
        metaString += "<meta property=\"og:image\" content=\"" + CONFIG.SITE_ROOT + this.metadata.banner + "\">";
        //logo
        metaString += "<link rel=\"icon\" type=\"image/png\" href=\"" + CONFIG.LOGO + "\">";
        //json-ld
        var jsonLD = {
            "@context": "http://schema.org",
            "@type": "Article",
            "headline": this.metadata.title,
            "description": this.metadata.description,
            "datePublished": utils.date2ISO(this.metadata.published),
            "thumbnailUrl": this.metadata.banner,
            "image": this.metadata.banner,
            "author":[],
            "keywords": this.metadata.categories
        }
        /*for(var i = 0;i < this.metadata.authors.length;i++){
            jsonLD.author.push({
                "@type":"Person",
                "name":this.metadata.authors[i]
            });
        }*/
        for(var i = 0;i < this.authors.length;i++){
            jsonLD.author.push({
                "@type":"Person",
                "name":this.authors[i].metadata.name,
                "alternateName":this.authors[i].metadata.abbr,
                "url":"/author/"+this.authors[i].path+".html"
            });
        }
        metaString += "<script type=\"application/ld+json\">\n";
        metaString += utils.rmvEntities(JSON.stringify(jsonLD)) + "\n";
        metaString += "</script>\n";
        //stylesheet
        if(preview){
            metaString += "<style>"+fs.readFileSync("assets/styles/article.css","utf-8")+"</style>";
        }else{
            metaString += "<link class=\"articleStyles\" rel=\"stylesheet\" href=\"/assets/styles/article.css\">";
        }
        metaString += "<script defer src=\"/assets/scripts/audio-player.js\"></script>";
        return metaString;
    }
    /**
     * Rendert die Artikelseite
     * @param {Boolean} preview Ob die Seite im Vorschaumodus gerendert werden soll
     * @returns {string} Quellcode der Artikelseite
     */
    renderArticlePage(preview = false){
        var authorArray = [];
        for(var i = 0;i < this.authors.length;i++){
            authorArray.push("<a href=\"/author/" + this.authors[i].path + ".html\" itemprop=\"name\">" + this.authors[i].metadata.name + "</a>");
        }
        var template = CONFIG.BASIC_TEMPLATE;
        if(preview){
            template = template.replace("<link rel=\"stylesheet\" href=\"/assets/styles/main.css\">",
                "<style>" + fs.readFileSync("assets/styles/main.css","utf-8") + "</style>"
            );
        }
        var page = template
            .replace("<!--METADATA-->",this.renderMetaTags(preview))
            .replace("<!--CONTENT-->","<div class=\"banner-image\" data-bg-img=\"" + this.metadata.banner +
                "\"></div><article itemscope itemtype=\"http://schema.org/Article\"><h1 itemprop=\"headline\">" +
                this.metadata.title + "</h1><div id=\"content\"><span itemprop=\"author\" itemscope itemtype=\"http://schema.org/Person\">Von " + authorArray.join(", ") +
                "</span>&nbsp;&nbsp;<time itemprop=\"datePublished\" datetime=\"" + utils.date2ISO(this.metadata.published) +
                "\">Veröffentlicht am "+this.metadata.published+"</time><br><br><br><div itemprop=\"articleBody\">"+this.htmlContent+"</div></div></article>");
        if(preview){
            const {JSDOM} = require("jsdom");
            const dom = new JSDOM(page);
            let images = dom.window.document.querySelectorAll("img");
            for(var i = 0;i < images.length;i++){
                if(images[i].src.startsWith("/")){
                    try{
                        images[i].src = utils.img2base64("." + images[i].src);
                    }catch(e){
                        console.log(e);
                    }
                }
            }
            page = dom.serialize();
        }
        return page;
    }
}