const fs = require("fs");

module.exports = class API{
    constructor(){
        this.articles = [];
        this.authorArticles = {};
        var articles = fs.readdirSync("./articles");
        for(var i = 0; i < articles.length; i++){
            var article = JSON.parse(fs.readFileSync("./articles/" + articles[i] + "/meta.json", "utf8"));
            article.path = articles[i];
            for(var j = 0; j < article.authors.length; j++){
                if(!this.authorArticles[article.authors[j]]){
                    this.authorArticles[article.authors[j]] = [];
                }
                this.authorArticles[article.authors[j]].push(article);
            }
        }
        this.authors = [];
        var authors = fs.readdirSync("./authors");
        for(var i = 0; i < authors.length; i++){
            var author = JSON.parse(fs.readFileSync("./authors/" + authors[i] + "/meta.json", "utf8"));
            author.path = authors[i];
            this.authors.push(author);
        }
    }
    writeAPI(){
        fs.writeFileSync("./root/api/articles.json", JSON.stringify(this.articles));
        fs.writeFileSync("./root/api/authors.json", JSON.stringify(this.authors));
        fs.writeFileSync("./root/api/authorArticles.json", JSON.stringify(this.authorArticles));
    }
}