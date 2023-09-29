const fs = require("fs");
const CONFIG = require("./utils/config");
const utils = require("./utils/functions");
const {marked} = require("marked");
const postcss = require("postcss");
const UglifyJS = require("uglify-js");

const rdl = require("readline");
/*
const rl = rdl.createInterface({
    input: process.stdin,
    output: process.stdout
});*/

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
/*
var lineBuffer = [];
var spinnerStates = ['◜','◠','◝','◞','◡','◟'];

function writeLineBuffer(){
    rdl.clearScreenDown(process.stdout);
    var string = "\r"+lineBuffer.join("\x1b[0m     \n")+ "\x1b[0m";
    for(var i = 0;i < spinnerStates.length;i++){
        string = string.replaceAll(spinnerStates[i], "\x1b[32m"+spinnerStates[i]+"\x1b[34m");
    }
    process.stdout.write(string);
    rdl.moveCursor(process.stdout, 10, -lineBuffer.length+1);
}
var msg = "Lade Konfigurationen...";
function warn(text){
    var lastItem = lineBuffer[lineBuffer.length-1];
    lineBuffer[lineBuffer.length-1] = text;
    lineBuffer.push(lastItem);
    writeLineBuffer();
}
async function setSpinnerText(text){
    await sleep(2000);
    if(lineBuffer.length > 0){
        lineBuffer[lineBuffer.length-1] = msg;
    }
    msg = text;
    if(CONFIG.DEBUG){
        console.log(text);
        return;
    }
    lineBuffer.push("  "+text);
    writeLineBuffer();
}

setSpinnerText(msg);
if(!CONFIG.DEBUG){
    setInterval(function(){
        const spinnerOffset = 0;
        if(lineBuffer.length === 0){
            return;
        }
        var lastItem = lineBuffer[lineBuffer.length-1];
        var index = spinnerStates.indexOf(lastItem[spinnerOffset]);
        index++;
        if(index >= spinnerStates.length){
            index = 0;
        }
        lineBuffer[lineBuffer.length-1] = spinnerStates[index] + lastItem.slice(1);
        writeLineBuffer();
    },50);
}*/
var Log = require("./utils/StatusLog");
var log = new Log();
async function setSpinnerText(text){
    await log.setSpinnerText(text);
}
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
    gfm:true,
    pedantic:false,
    renderer:{
        image:function(href,title,text){
            return "<figure><img loading=\"lazy\" src=\"" + utils.str(href) + "\" title=\"" + utils.str(title) + "\" alt=\"" + utils.str(text) + "\"><figcaption>"+utils.str(text)+"</figcaption></figure>";
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
async function setupRootDir(){
    await setSpinnerText("Leere root-Verzeichnis...");
    try{
        fs.rmSync("root/index.html");
    }catch(e){}
    cleanDir("root/api");
    cleanDir("root/author");
    cleanDir("root/article");
    cleanDir("root/assets");
    cleanDir("root/category");
    async function copyFiles(from,to,statusText){
        try{
            await setSpinnerText(statusText);
            fs.cpSync(from,to,{recursive:true});
        }catch(e){
            log.warn("Kopieren fehlgeschlagen. Versuche neu..");
            await sleep(500);
            await copyFiles(from,to,statusText);
        }
    }
    await copyFiles("api/","root/api","Kopiere API-Dateien...");
    await copyFiles("assets/","root/assets","Kopiere Asset-Dateien...");
    fs.cpSync("templates/service-worker.js","root/service-worker.js",{recursive:true});
    await setSpinnerText("Kompiliere CSS-Dateien...");
    if(CONFIG.MINIFY){
        await setSpinnerText("Komprimiere CSS-Dateien...");
    }
    postcss(plugins).process(fs.readFileSync("root/assets/styles/main.css","utf-8"),{
        from:undefined
    }).then(function(res){
        var css = res.css;
        //console.log(css);
        fs.writeFileSync("root/assets/styles/main.css",
        css,"utf-8");
    });
    if(CONFIG.MINIFY){
        await setSpinnerText("Komprimiere JS-Dateien...");
        minifyJsFile("root/assets/scripts/layout.js");
        minifyJsFile("root/service-worker.js");
    }
}

setupRootDir().then(async function(){

    /** @type {Homepage} */
    var homepage = new Homepage();

    /** @type {RssFeed} */
    var rssFeed = new RssFeed(CONFIG.SITE_NAME,CONFIG.SITE_ROOT,CONFIG.DESCRIPTION);

    await setSpinnerText("Lade Autoren...");
    /** @type {Author[]} */
    var authors = {};
    var authorsDir = fs.readdirSync("authors");

    for(var i = 0;i < authorsDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Lade Autor \"" + authorsDir[i] + "\"...");
        }
        authors[authorsDir[i]] = new Author(authorsDir[i]);
    }

    await setSpinnerText("Lade Kategorien...");
    /** @type {Category[]} */
    var categories = {};
    var categoriesDir = fs.readdirSync("categories");

    for(var i = 0;i < categoriesDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Lade Kategorie \"" + categoriesDir[i] + "\"...");
        }
        categories[categoriesDir[i]] = new Category(categoriesDir[i]);
    }

    await setSpinnerText("Lade Artikel...");
    /** @type {Article[]} */
    var articles = [];
    var articlesDir = fs.readdirSync("articles");

    await setSpinnerText("Rendere Artikel-Seiten...");
    for(var i = 0;i < articlesDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Rendere Artikel \"" + articlesDir[i] + "\"...");
        }
        articles.push(new Article(articlesDir[i]));
        rssFeed.articles.push(articles[i]);
        for(var j = 0;j < articles[i].metadata.authors.length;j++){
            if(articles[i].metadata.authors[j] in authors){
                authors[articles[i].metadata.authors[j]].registerArticle(articles[i]);
            }else{
                log.warn("Der Autor \""+articles[i].metadata.authors[j]+"\" existiert nicht, wurde aber im Artikel \""+articles[i].path+"\" zugewiesen.");
            }
        }
        for(var j = 0;j < articles[i].metadata.categories.length;j++){
            if(articles[i].metadata.categories[j] in categories){
                categories[articles[i].metadata.categories[j]].registerArticle(articles[i]);
            }else{
                log.warn("Die Kategorie \""+articles[i].metadata.categories[j]+"\" existiert nicht, wurde aber im Artikel \""+articles[i].path+"\" zugewiesen.");
            }
        }
        fs.writeFileSync("root/article/"+articles[i].path+".html",articles[i].renderArticlePage(),"utf-8");
    }

    await setSpinnerText("Rendere Autor-Seiten...");
    for(var i = 0;i < authorsDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Rendere Autor \"" + authorsDir[i] + "\"...");
        }
        fs.writeFileSync("root/author/"+authors[authorsDir[i]].path+".html",authors[authorsDir[i]].renderAuthorPage(),"utf-8");
    }

    await setSpinnerText("Rendere Kategorie-Seiten...");
    for(var i = 0;i < categoriesDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Rendere Kategorie \"" + categoriesDir[i] + "\"...");
        }
        homepage.addCategory(categories[categoriesDir[i]]);
        fs.writeFileSync("root/category/"+categories[categoriesDir[i]].path+".html",categories[categoriesDir[i]].renderCategoryPage(),"utf-8");
    }

    await setSpinnerText("Rendere RSS-Feed...");
    fs.writeFileSync("root/feed.xml",rssFeed.renderFeed(),"utf-8");
    await setSpinnerText("Rendere Homepage...");
    fs.writeFileSync("root/index.html",homepage.renderHomepage(),"utf-8");
    await setSpinnerText("Rendere Webmanifest...");
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

    setSpinnerText("Fertig!");
    log.stop();
});