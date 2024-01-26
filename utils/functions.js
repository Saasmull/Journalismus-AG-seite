const fs = require("fs");
const path = require("path");

module.exports = {
    date2ISO:function(string){
        var date = string.split(".").reverse().map(str => parseInt(str, 10));
        date[1]--;
        date[2]++;
        return (new Date(...date)).toISOString().split("T")[0];
    },
    sortArticles:function(array) {
        return array.sort((a, b) => {
          const dateA = new Date(this.date2ISO(a.metadata.published));
          const dateB = new Date(this.date2ISO(b.metadata.published));
          
          // Compare the dates in descending order
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          
          return 0; // Dates are equal
        });
    },      
    str:function str(string){
        return (typeof string === "string"?string:(string?string+"":""));
    },
    rmvEntities(string){
        return string.replaceAll("&shy;","");
    },
    img2base64(img){
        const imageBuffer = fs.readFileSync(img);
        console.log(img);
        const fileExtension = path.extname(img).slice(1);
        const mimeType = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "avif": "image/avif",
            "webp": "image/webp",
        }[fileExtension.toLowerCase()];
        return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
    }
}