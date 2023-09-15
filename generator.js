
const rdl = require("readline");

var ifc = rdl.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function addZero(string,length){
    while(string.length<length){
        string = "0"+string;
    }
    return string;
}

var BLUE = "\x1b[34m";
var RESET = "\x1b[0m";

ifc.question(BLUE+"Kategorie oder Artikel erstellen?"+RESET+"\n   >",function(type) {
    if(type.toLowerCase().startsWith("artikel")) {
        ifc.question(BLUE+"Titel:"+RESET+"\n   >",function(title){
            var defaultPath = title.toLowerCase().replaceAll(/[ \_\%\:]/g, "-").replaceAll(/[\!\?\,\.]/g, "");
            ifc.question(BLUE+"Dateipfad:"+RESET+"("+BLUE+defaultPath+RESET+")\n   >", function(path = defaultPath){
                ifc.question(BLUE+"Beschreibung:"+RESET+"\n   >", function(description){
                    ifc.question(BLUE+"Link zum Vorschaubild:"+RESET+"\n   >", function(bannerPath){
                        ifc.question(BLUE+"Autoren, kommagetrennt:"+RESET+"\n   >", function(authors){
                            ifc.question(BLUE+"Kategorien, kommagetrennt:"+RESET+"\n   >", function(categories){
                                var d = new Date();
                                var defaultDate = addZero(d.getDate(),2)+"."+addZero(d.getMonth(), 2)+"."+d.getFullYear();
                                ifc.question(BLUE+"Veröffentlichkeitsdatum:"+RESET+"("+BLUE+defaultDate+RESET+")\n   >", function(date = defaultDate){
                                    ifc.write("Artikel wird erstellt");
                                    ifc.close();
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});