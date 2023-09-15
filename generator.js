const inquirer = require("inquirer");
const fs = require("fs");


function addZero(string,length){
    return ("0"+string).slice(-length);
}


function askType(){
    inquirer.prompt([
        {
            type: "list",
            name: "type",
            message: "Kategorie oder Artikel erstellen?",
            choices: ["Kategorie", "Artikel"]
        }
    ]).then(answers => {
        if(answers.type == "Kategorie"){
            askCategory();
        }else{
            askTitle();
        }
    });
}

function askTitle(){
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Titel:"
        }
    ]).then(answers => {
        askPath(answers.title);
    });
}

function askPath(title){
    inquirer.prompt([
        {
            type: "input",
            name: "path",
            message: "Dateipfad:",
            default: title.toLowerCase().replaceAll(/[ \_\%]/g, "-").replaceAll(/[\!\?\,\.\:]/g, "")
        }
    ]).then(answers => {
        if(fs.existsSync("/articles/"+answers.path)){
            inquirer.ui.
            console.log("\x1b[31mArtikel existiert bereits\x1b[0m");
            askPath(title);
        }else{
            askDescription(title, answers.path);
        }
    });
}

function askDescription(title, path){
    inquirer.prompt([
        {
            type: "input",
            name: "description",
            message: "Beschreibung:"
        }
    ]).then(answers => {
        askBanner(title, path, answers.description);
    });
}

function askBanner(title, path, description){
    inquirer.prompt([
        {
            type: "input",
            name: "banner",
            message: "Link zum Vorschaubild:"
        }
    ]).then(answers => {
        if(answers.banner.startsWith("http") || !answers.banner.startsWith("/assets/images/") || !fs.existsSync(answers.banner)){
            console.log("\x1b[33mBanner existiert nicht\x1b[0m");
        }
        askAuthors(title, path, description, answers.banner);
    });
}

function askAuthors(title, path, description, banner){
    inquirer.prompt([
        {
            type: "input",
            name: "authors",
            message: "Autoren, kommagetrennt:"
        }
    ]).then(answers => {
        askCategories(title, path, description, banner, answers.authors);
    });
}

function askCategories(title, path, description, banner, authors){
    inquirer.prompt([
        {
            type: "input",
            name: "categories",
            message: "Kategorien, kommagetrennt:"
        }
    ]).then(answers => {
        var wasError = false;
        if(answers.categories){
            var catList = answers.categories.includes(",")?answers.categories.split(","):[answers.categories];
            for(var i = 0; i < catList.length; i++){
                if(!fs.existsSync("categories/"+catList[i]+"/")){
                    console.log("\x1b[31mKategorie "+catList[i]+" existiert nicht\x1b[0m");
                    wasError = true;
                }
            }
        }
        if(wasError){
            askCategories(title, path, description, banner, authors);
        }else{
            askDate(title, path, description, banner, authors, answers.categories);
        }
    });
}

function askDate(title, path, description, banner, authors, categories){
    var d = new Date();
    var defaultDate = addZero(d.getDate(), 2)+"."+addZero(d.getMonth(), 2)+"."+d.getFullYear();
    inquirer.prompt([
        {
            type: "input",
            name: "date",
            message: "Veröffentlichungsdatum:",
            default: defaultDate
        }
    ]).then(answers => {
        console.log("Artikel wird erstellt");
        console.log("Titel: "+title);
        console.log("Dateipfad: "+path);
        console.log("Beschreibung: "+description);
        console.log("Vorschaubild: "+banner);
        console.log("Autoren: "+authors);
        console.log("Kategorien: "+categories);
        console.log("Veröffentlichungsdatum: "+answers.date);
    });
}

askType();