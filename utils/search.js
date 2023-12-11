const fs = require("fs");


const utils = require("./functions");

const articlesFolders = fs.readdirSync("articles");

module.exports = class Search{
    constructor(query){
        this.query = query;
        this.results = this.evaluate();
    }
    /**
     * Gibt alle Nomen in einem deutschen Text zurück.
     * @param {string} text Ein deutschsprachiger Text
     * @returns {string[]} Alle Nomen im Text
     */
    #findGermanNouns(text){
        return text
            .split(" ")
            .filter(word => word[0] === word[0].toUpperCase());
    }
    /**
     * Gibt die Levenstein-Distanz zwischen zwei Strings zurück.
     * @param {string} a Erster String
     * @param {string} b Zweiter String
     * @returns {number} Levenstein-Distanz zwischen a und b
     */
    #levensteinDistance(a, b){
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
    #distanceToArray(a,b){
        var distance = [];
        for(var i = 0;i < b.length;i++){
            distance.push(this.#levensteinDistance(a,b[i]));
        }
        return distance;
    }
    /**
     * Berechnet den Durchschnitt aller Zahlen in einem Array.
     * @param {number[]} array Ein Array mit Zahlen
     * @returns {number} Der Durchschnitt aller Zahlen in dem Array
     */
    #average(array){
        var sum = 0;
        for(var i = 0;i < array.length;i++){
            sum += array[i];
        }
        return sum/array.length;
    }
    #score(query, title, description, synonyms = []){
        var textQuery = query.replaceAll(/[!?.,"]/g,"");
        var parts = textQuery.includes(" ")?textQuery.split(" "):[textQuery];
        var score = 0;
        for(var i = 0;i < parts.length;i++){
            score += this.#average(this.#distanceToArray(parts[i], this.#findGermanNouns(utils.rmvEntities(title)))) * 0.1;
            score += Math.min(...this.#distanceToArray(parts[i], this.#findGermanNouns(utils.rmvEntities(title)))) * 0.1;
            score -= (utils.rmvEntities(title) + description).toLowerCase().includes(parts[i].toLowerCase()) * 10;
            score += this.#average(this.#distanceToArray(parts[i], synonyms)) * 5;
            score += Math.min(...this.#distanceToArray(parts[i], synonyms)) * 15;
            score -= (synonyms.join(" ")).toLowerCase().includes(parts[i].toLowerCase()) * 50;
        }
        score += this.#average(this.#distanceToArray(query, this.#findGermanNouns(utils.rmvEntities(title)))) * 0.1;
        score += Math.min(...this.#distanceToArray(query, this.#findGermanNouns(utils.rmvEntities(title)))) * 0.1;
        score -= (utils.rmvEntities(title) + description).toLowerCase().includes(query.toLowerCase()) * 30;
        return score;
    }
    evaluate(){
        var query = this.query;
        var results = [];
        for(var i = 0;i < articlesFolders.length;i++){
            var article = articlesFolders[i];
            var metadata = JSON.parse(fs.readFileSync("articles/"+article+"/meta.json","utf-8"));
            var distance = this.#score(query, metadata.title, metadata.description, metadata.synonyms);
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
    render(){
        var page = fs.readFileSync("root/search.html","utf8")
            .replace("value=\"\"", "value=\"" + this.query.replaceAll("\"","&quot;") + "\"")
            .replace("<title>Suche</title>","<title>Suche nach \"" + this.query.replaceAll("<","&lt;").replaceAll(">","&gt;") + "\"</title>");
        var results = "<div id=\"content\">";
        for(var i = 0;i < this.results.length;i++){
            var result = this.results[i];
            results += "<div class=\"result\"><a href=\"/article/" + result.path + ".html\"><h3>" + result.title + "</h3></a><p>" + result.description + "</p></div>";
        }
        return page.replace("<!--RESULTS-->",results+"</div>");
    }

}