const fs = require("fs");
const CONFIG = require("./utils/config");
const utils = require("./utils/functions");
const {marked} = require("marked");
const postcss = require("postcss");
const UglifyJS = require("uglify-js");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

var Log = require("./utils/StatusLog");
var log = new Log();
async function setSpinnerText(text){
    await log.setSpinnerText(text);
}

const onlyUpdate = process.argv.includes("--only-update");

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

const graphExt = {
    name:"graph",
    level:"block",
    start(src){
        return src.match(/graph/)?.index;
    },
    tokenizer(src, tokens){
        var rule = /^graph(\["[A-z0-9.,\- ]+",([0-9.]+,)*[0-9.]+\])/;
        var match = rule.exec(src);
        if(match){
            var data = JSON.parse(match[1]);
            return {
            type:"graph",
            raw:match[0],
            title:data.shift(),
            dataset:data
            };
        }
    },
    renderer(token){
        console.log(token);
        var id = token.title.replaceAll(" ","-").toLowerCase();
        return `<div id="${id}" style="margin:32px 0;"><h3 style="margin:0 16px;">${token.title}</h3><div style="min-height:200px;height:25vw;position:relative;width:100%;" class="line-graph"></div></div>
<script src="/assets/scripts/graph.js"></script>
<script>
(function(){
    var graphEl = document.querySelector("#${id}>.line-graph");
    if(LineGraph){
        var graph = new LineGraph(graphEl,${token.dataset.length});
        graph.addData([${token.dataset.join(",")}]);
    }
})();
</script>`;
    }   
};

marked.use({
    gfm:true,
    pedantic:false,
    extensions:[graphExt],
    renderer:{
        heading: function(text, level, raw){
            var id = text.replaceAll(/[^A-z0-9äöüß\?\!]/gi, "-").toLowerCase();
            var anchorTag = level<2?"":"<a href=\"#" + id + "\">#</a> ";
            return "<h" + level + " id=\"" + id + "\">" + anchorTag + "<span>" + text + "</span></h" + level + ">";
        },
        image:function(href,title,text){
            return "<figure><img loading=\"lazy\" src=\"" + utils.str(href) + "\" title=\"" + utils.str(title) + "\" alt=\"" + utils.str(text) + "\"><figcaption>"+utils.str(text)+"</figcaption></figure>";
        }
    }
});

const Article = require("./utils/Article");
const Author = require("./utils/Author");
const Category = require("./utils/Category");
const Homepage = require("./utils/Homepage");
const ErrorPage = require("./utils/ErrorPage");
const ImprintPage = require("./utils/ImprintPage");
const OfflinePage = require("./utils/OfflinePage");
const PrivacyPolicyPage = require("./utils/PrivacyPolicyPage");
const RssFeed = require("./utils/RssFeed");
const Sitemap = require("./utils/Sitemap");

if(CONFIG.MINIFY && !onlyUpdate){
    function minifyJs(string){
        return UglifyJS.minify(string,{
            mangle:{
                toplevel:true
            }
        }).code;
    }
    function minifyJsFile(path){
        fs.writeFileSync(path,minifyJs(fs.readFileSync(path,"utf8")),"utf8");
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
    if(!onlyUpdate){
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
        fs.copyFileSync("templates/robots.txt","root/robots.txt");
        await copyFiles("api/","root/api","Kopiere API-Dateien...");
        await copyFiles("assets/","root/assets","Kopiere Asset-Dateien...");
        var sw = fs.readFileSync("templates/service-worker.js","utf8");
        fs.writeFileSync("root/service-worker.js",sw.replace("<!--VERSION-->",CONFIG.VERSION),"utf8");
        await setSpinnerText("Kompiliere CSS-Dateien...");
        if(CONFIG.MINIFY){
            await setSpinnerText("Komprimiere CSS-Dateien...");
        }
        postcss(plugins).process(fs.readFileSync("root/assets/styles/main.css","utf8"),{
            from:undefined
        }).then(function(res){
            var css = res.css;
            //console.log(css);
            fs.writeFileSync("root/assets/styles/main.css",
            css,"utf8");
        });
        if(CONFIG.MINIFY){
            await setSpinnerText("Komprimiere JS-Dateien...");
            minifyJsFile("root/assets/scripts/layout.js");
            minifyJsFile("root/service-worker.js");
        }
    }
}

setupRootDir().then(async function(){

    /** @type {Homepage} */
    var homepage = new Homepage();

    /** @type {RssFeed} */
    var rssFeed = new RssFeed(CONFIG.SITE_NAME,CONFIG.SITE_ROOT,CONFIG.DESCRIPTION);

    /** @type {Sitemap} */
    var sitemap = new Sitemap(CONFIG.SITE_ROOT);
    sitemap.addSite("/index.html");

    await setSpinnerText("Lade Autoren...");
    /** @type {Author[]} */
    var authors = {};
    var authorsDir = fs.readdirSync("authors");

    for(var i = 0;i < authorsDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Lade Autor \"" + authorsDir[i] + "\"...");
        }
        sitemap.addSite("/author/"+authorsDir[i]+".html");
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
        sitemap.addSite("/category/"+categoriesDir[i]+".html");
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
        sitemap.addSite("/article/"+articlesDir[i]+".html");
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
        fs.writeFileSync("root/article/"+articles[i].path+".html",articles[i].renderArticlePage(),"utf8");
    }

    await setSpinnerText("Rendere Autor-Seiten...");
    for(var i = 0;i < authorsDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Rendere Autor \"" + authorsDir[i] + "\"...");
        }
        fs.writeFileSync("root/author/"+authors[authorsDir[i]].path+".html",authors[authorsDir[i]].renderAuthorPage(),"utf8");
    }

    await setSpinnerText("Rendere Kategorie-Seiten...");
    for(var i = 0;i < categoriesDir.length;i++){
        if(CONFIG.DEBUG){
            await setSpinnerText("Rendere Kategorie \"" + categoriesDir[i] + "\"...");
        }
        homepage.addCategory(categories[categoriesDir[i]]);
        fs.writeFileSync("root/category/"+categories[categoriesDir[i]].path+".html",categories[categoriesDir[i]].renderCategoryPage(),"utf8");
    }
    
    await setSpinnerText("Rendere Sitemap...");
    fs.writeFileSync("root/sitemap.xml",sitemap.renderSitemap(),"utf8");

    await setSpinnerText("Rendere RSS-Feed...");
    fs.writeFileSync("root/feed.xml",rssFeed.renderFeed(),"utf8");
    await setSpinnerText("Rendere Homepage...");
    fs.writeFileSync("root/index.html",homepage.renderHomepage(),"utf8");
    if(!onlyUpdate){
        await setSpinnerText("Rendere Fehlerseite...");
        fs.writeFileSync("root/error404.html",(new ErrorPage()).render(),"utf8");
        await setSpinnerText("Rendere Impressum...");
        fs.writeFileSync("root/imprint.html",(new ImprintPage()).render(),"utf8");
        await setSpinnerText("Rendere Offlineseite...");
        fs.writeFileSync("root/offline.html",(new OfflinePage()).render(),"utf8");
        await setSpinnerText("Rendere Datenschutzerklärung...");
        fs.writeFileSync("root/privacy-policy.html",(new PrivacyPolicyPage()).render(),"utf8");
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
            "icons": [
                {
                    "src": "/assets/images/logo/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/assets/images/logo/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any"
                }
            ],
            "theme_color": "#121212",
            "background_color": "#0078d4"
        },null,CONFIG.INDENT),"utf8");
    }

    setSpinnerText("Fertig!");
    log.stop();
});