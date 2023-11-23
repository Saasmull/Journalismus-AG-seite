const fs = require("fs");
const sharp = require("sharp");
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

async function main(){
for(var i = 0;i < images.length;i++){
    if(typeof images[i].url !== "string"){
        console.log("ERR NSTR");
    }
    if(images[i].url !== "local" || images[i].url.startsWith("http")){
        try{
        await downloadImage(images[i].url,"assets/images/"+images[i].file);
        }catch(e){
            console.log(e);
            continue;
        }
    }
    var format = images[i].file.split(".")[1];
    switch(format){
        case "jpg":
        case "jpeg":
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .jpeg({quality:40,mozjpeg:true})
                .toFile("assets/images/preview/"+images[i].file);
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .jpeg({quality:55,mozjpeg:true})
                .toFile("assets/images/mobile/"+images[i].file);
            break;
        case "png":
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .png({quality:40,palette:true})
                .toFile("assets/images/preview/"+images[i].file);
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .png({palette:true})
                .toFile("assets/images/mobile/"+images[i].file);
            break;
        case "webp":
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .webp({quality:40})
                .toFile("assets/images/preview/"+images[i].file);
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .webp({quality:55})
                .toFile("assets/images/mobile/"+images[i].file);
            break;
        case "gif":
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .gif({quality:40})
                .toFile("assets/images/preview/"+images[i].file);
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .gif({quality:55})
                .toFile("assets/images/mobile/"+images[i].file);
            break;
        case "avif":
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .avif({quality:40})
                .toFile("assets/images/preview/"+images[i].file);
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .avif({quality:55})
                .toFile("assets/images/mobile/"+images[i].file);
            break;
        default:
            await sharp("assets/images/"+images[i].file)
                .resize(480,192)
                .jpeg({quality:40,mozjpeg:true})
                .toFile("assets/images/preview/"+images[i].file.replace(format,".jpg"));
            await sharp("assets/images/"+images[i].file)
                .resize(720,576)
                .jpeg({quality:55,mozjpeg:true})
                .toFile("assets/images/mobile/"+images[i].file.replace(format,".jpg"));
    }
}
}
main();
/*
var articlesDir = fs.readdirSync("articles");

for(var i = 0;i < articlesDir.length;i++){  
    var metaData = JSON.parse(fs.readFileSync("articles/"+articlesDir[i]+"/meta.json","utf8"));
    if(metaData.banner.startsWith("http")){
        console.log(metaData.banner);
    }
}
*/