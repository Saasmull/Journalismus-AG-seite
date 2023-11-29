
const utils = require("./functions");

function findGermanNouns(text){
    var nouns = [];
    var words = text.split(" ");
    for(var i = 0;i < words.length;i++){
        var word = words[i];
        if(word[0] === word[0].toUpperCase()){
            nouns.push(word);
        }
    }
    return nouns;
}

function levensteinDistance(a, b){
    var m = a.length,
        n = b.length,
        d = [],
        i, j;
    
    if(!m){
        return n;
    }
    if(!n){
        return m;
    }
    
    for (i = 0; i <= m; i++){
        d[i] = [i];
    }
    for (j = 0; j <= n; j++){
        d[0][j] = j;
    }
    
    for (j = 1; j <= n; j++){
        for (i = 1; i <= m; i++){
            if(a[i-1] == b[j-1]){
                d[i][j] = d[i-1][j-1];
            }else{
                d[i][j] = Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]) + 1
            }
        }
    }
    
    return d[m][n];
}

function distanceToArray(a,b){
    var distance = [];
    for(var i = 0;i < b.length;i++){
        distance.push(levensteinDistance(a,b[i]));
    }
    return distance;
}

module.exports = function search(query){
    var results = [];
    const fs = require("fs");
    var articles = fs.readdirSync("articles");
    for(var i = 0;i < articles.length;i++){
        var article = articles[i];
        var metadata = JSON.parse(fs.readFileSync("articles/"+article+"/meta.json","utf-8"));
        var distance = Math.max(0,
            (
                Math.min(...distanceToArray(query, findGermanNouns(utils.rmvEntities(metadata.title)))) +
                levensteinDistance(query,utils.rmvEntities(metadata.title)) +
                levensteinDistance(query, metadata.description)
            ) -
            ((metadata.title + metadata.description).toLowerCase().includes(query.toLowerCase()) * 100)
        );
        results.push({
            title: metadata.title,
            description: metadata.description,
            path: article,
            distance: distance
        });
    }
    results.sort((a,b) => {
        return a.distance - b.distance;
    });
    return results.slice(0, 50);
}