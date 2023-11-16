const fs = require("fs");
const axios = require("axios");
const images = JSON.parse(fs.readFileSync("images.json","utf8"));

async function downloadImage(url,filepath){
    const response = await axios({
        url,
        method:"GET",
        responseType:"stream"
    });
    return new Promise((resolve,reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on("error",reject)
            .once("close",() => resolve(filepath));
    });
}

for(var i = 0;i < images.length;i++){
    if(typeof images[i].url !== "string"){
        console.log("ERR NSTR");
    }
    if(images[i].url === "local" || !images[i].url.startsWith("http")){
        continue;
    }
    downloadImage(images[i].url,"assets/images/"+images[i].file);
}
var articlesDir = fs.readdirSync("articles");

for(var i = 0;i < articlesDir.length;i++){  
    var metaData = JSON.parse(fs.readFileSync("articles/"+articlesDir[i]+"/meta.json","utf8"));
    if(metaData.banner.startsWith("http")){
        console.log(metaData.banner);
    }
}