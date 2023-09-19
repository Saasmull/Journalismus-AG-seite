const fs = require("fs");
const CONFIG = require("./utils/config");

const Article = require("./utils/Article");
const Author = require("./utils/Author");
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


/** @type {Author[]} */
var authors = {};
var authorsDir = fs.readdirSync("authors");

for(var i = 0;i < authorsDir.length;i++){
    authors[authorsDir[i]] = new Author(authorsDir[i]);
}


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
    for(var j = 0;j < articles[i].metadata.authors.length;j++){
        authors[articles[i].metadata.authors[j]].registerArticle(articles[i]);
    }
    for(var j = 0;j < articles[i].metadata.categories.length;j++){
        categories[articles[i].metadata.categories[j]].registerArticle(articles[i]);
    }
    fs.writeFileSync("root/article/"+articles[i].path+".html",articles[i].renderArticlePage(),"utf-8");
}

for(var i = 0;i < authorsDir.length;i++){
    fs.writeFileSync("root/author/"+authors[authorsDir[i]].path+".html",authors[authorsDir[i]].renderAuthorPage(),"utf-8");
}

for(var i = 0;i < categoriesDir.length;i++){
    homepage.addCategory(categories[categoriesDir[i]]);
    fs.writeFileSync("root/category/"+categories[categoriesDir[i]].path+".html",categories[categoriesDir[i]].renderCategoryPage(),"utf-8");
}

fs.writeFileSync("root/index.html",homepage.renderHomepage(),"utf-8");
fs.writeFileSync("root/manifest.json",`{
    "name":"${CONFIG.SITE_NAME}",
    "short_name":"${CONFIG.SITE_NAME}",
    "description":"Hello",
    "scope": "/index.html",
    "start_url": "/index.html",
    "id":"/index.html",
    "display":"standalone",
    "display_override":["window-controls-overlay"],
    "icons":[
        {
            "src":"/assets/images/icon.png",
            "type":"image/png",
            "sizes":"512x512",
            "purpose": "any"
        }
    ],
    "background_color": "#000000",
    "theme_color": "#000000"
}`,"utf-8");
fs.writeFileSync("root/service-worker.js",`
self.addEventListener("install", function (e){
    e.waitUntil(
        //Add here all the files which are needed that your PWA can run offline:
        caches.open("static-test").then(cache => {
            return cache.addAll([
                "/index.html"
            ]);
        })
    );
})
self.addEventListener("fetch", function (e){
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
})
`,"utf-8");