const fs = require("fs");
const CONFIG = require("./utils/config");
const utils = require("./utils/functions");
const {marked} = require("marked");
const postcss = require("postcss");
const UglifyJS = require("uglify-js");

const plugins = [
    require("postcss-custom-properties")({
        preserve: true
    }),
    require("autoprefixer")({
        overrideBrowserslist:"> 0.0000001%"
    })
];

if(CONFIG.MINIFY){
    plugins.push(require("postcss-minify")());
}

marked.use({
    renderer:{
        image:function(href,title,text){
            return "<img loading=\"lazy\" src=\"" + utils.str(href) + "\" title=\"" + utils.str(title) + "\" alt=\"" + utils.str(text) + "\">";
        }
    }
});

const Article = require("./utils/Article");
const Author = require("./utils/Author");
const Category = require("./utils/Category");
const Homepage = require("./utils/Homepage");
const RssFeed = require("./utils/RssFeed");

if(CONFIG.MINIFY){
    function minifyJs(string){
        return UglifyJS.minify(string,{
            mangle:{
                toplevel:true
            }
        }).code;
    }
    function minifyJsFile(path){
        fs.writeFileSync(path,minifyJs(fs.readFileSync(path,"utf-8")),"utf-8");
    }
}
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
    cleanDir("root/api");
    cleanDir("root/author");
    cleanDir("root/article");
    cleanDir("root/assets");
    cleanDir("root/category");
    fs.cpSync("api/","root/api/",{recursive:true});
    fs.cpSync("assets/","root/assets/",{recursive:true});
    fs.cpSync("templates/service-worker.js","root/service-worker.js",{recursive:true});
    postcss(plugins).process(fs.readFileSync("root/assets/styles/main.css","utf-8"),{
        from:undefined
    }).then(function(res){
        var css = res.css;
        //console.log(css);
        fs.writeFileSync("root/assets/styles/main.css",
        css,"utf-8");
    });
    if(CONFIG.MINIFY){
        minifyJsFile("root/assets/scripts/layout.js");
        minifyJsFile("root/service-worker.js");
    }
}

setupRootDir();
/** @type {Homepage} */
var homepage = new Homepage();

/** @type {RssFeed} */
var rssFeed = new RssFeed(CONFIG.SITE_NAME,CONFIG.SITE_ROOT,CONFIG.DESCRIPTION);


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
    rssFeed.articles.push(articles[i]);
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

fs.writeFileSync("root/feed.xml",rssFeed.renderFeed(),"utf-8");
fs.writeFileSync("root/index.html",homepage.renderHomepage(),"utf-8");
fs.writeFileSync("root/manifest.json",JSON.stringify({
    "name":CONFIG.SITE_NAME,
    "short_name":CONFIG.SITE_NAME,
    "description":CONFIG.DESCRIPTION,
    "scope": "/",
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
},null,(CONFIG.MINIFY?"":"\t")),"utf-8");