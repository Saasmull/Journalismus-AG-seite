const fs = require("fs");
const CONFIG = require("./utils/config");

const Article = require("./utils/Article");
const Category = require("./utils/Category");
const Homepage = require("./utils/Homepage");

/*
const SITE_NAME = "Blog";
const BASIC_TEMPLATE = fs.readFileSync("templates/basic.html","utf-8").replace("<!--SITENAME-->", SITE_NAME);
*/
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