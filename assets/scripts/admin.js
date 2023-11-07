function loadMetadataEditor(id,metadata){
    var editorContent = `<div class="metadata-editor"><input type="text" value="${metadata.title||""}"><br>
    <input type="text" value="${id||""}"><br>
    <textarea>${metadata.description||""}</textarea></div>
    <div class="tmce"></div>`;
    document.querySelector(".editor-window-content").innerHTML = editorContent;
}
function loadContentEditor(id,content){
    var editorContent = `<textarea class="md-edit"></textarea>`;
    document.querySelector(".editor-window-content").innerHTML = editorContent;
    document.querySelector(".md-edit").value = content;
    document.querySelector(".md-edit").addEventListener("keyup",function(ev){
        callAPI("SchreibeArtikelInhalt",{id:id,content:ev.target.value});
    })
}
function toggleEditor(){
    document.querySelector("#editor-window").classList.toggle("closed");
}
document.querySelector("button.editor-window-close").addEventListener("click",toggleEditor);
var tablinks = document.querySelectorAll(".tablink");
var tabcontents = document.querySelectorAll(".tabcontent");
for(var i = 0;i < tablinks.length;i++){
    tablinks[i].addEventListener("click",function(e){
        openTab(e.target.id);
    })
}
function openTab(tab){
    for(var i = 0;i < tablinks.length;i++){
        tablinks[i].classList.remove("activeTab");
    }
    for(var i = 0;i < tabcontents.length;i++){
        tabcontents[i].style.display = "none";
    }
    document.getElementById(tab).classList.add("activeTab");
    document.getElementById(tab+"Tab").style.display = "block";
}
function date2ISO(string){
    var date = string.split(".").reverse().map(str => parseInt(str, 10));
    date[1]--;
    date[2]++;
    return (new Date(...date)).toISOString().split('T')[0];
}
function sortArticles(array) {
    return array.sort(function(a, b){
      const dateA = new Date(date2ISO(a.metadata.published));
      const dateB = new Date(date2ISO(b.metadata.published));
      
      // Compare the dates in descending order
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      
      return 0; // Dates are equal
    });
}
class ArticleItem{
    constructor(id,data){
        var glob = this;
        this.id = id;
        this.data = data;
        this.el = document.createElement("div");
        this.el.classList.add("list-row");
        this.el.classList.add("card");
        this.el.innerHTML = `<span class="list-col short">${data.title}</span>
        <a class="list-col short" href="/article/${this.id}.html">/article/${this.id}.html</a>
        <span class="list-col long">${this.data.description}</span>
        <span class="list-col short">${this.data.authors.join(",")}</span>
        <button class="action-edit-metadata list-col short first">Metadaten bearbeiten</button>
        <button class="action-edit-content list-col short">Inhalt bearbeiten</button>`;
        this.el.querySelector("button.action-edit-metadata").addEventListener("click",function(){
            loadMetadataEditor(glob.id,glob.data);
            toggleEditor();
        });
        this.el.querySelector("button.action-edit-content").addEventListener("click",function(){
            callAPI("LeseArtikelInhalt",glob.id,null,function(content){
                loadContentEditor(glob.id,content);
                toggleEditor();
            });
        });
    }
}
class Articles{
    constructor(){
        this.articles = [];
        this.el = document.createElement("div");
        this.el.classList.add("articles");
    }
    addArticle(article){
        if(!this.existsArticle(article)){
            this.articles.push(article);
        }
    }
    existsArticle(article){
        for(var i of this.articles){
            if(i.id === article.id){
                return true;
            }
        }
        return false;
    }
    appendTo(element){
        element.appendChild(this.el);
    }
    render(){
        for(var i of this.articles){
            this.el.appendChild(i.el);
        }
    }
}
function callAPI(command,data,responseType,callback){
    var fd = new FormData();
    fd.append("action",command);
    var req = new XMLHttpRequest();
    req.open("POST","/al",true);
    req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    req.responseType = responseType;
    req.onload = function(ev){
        if(typeof callback ==="function"){
            callback(ev.target.response);
        }
    }
    if(typeof data === "undefined" || data === null || data === undefined){
        data = undefined;
    }
    if(["string","number","boolean"].includes(typeof data) ||
    (!["null","undefined"].includes(typeof data) && [Object,Array].includes(data.constructor))){
        data = JSON.stringify(data);
    }
    req.send("action="+command+(data?"&data="+encodeURIComponent(data+""):""));
}
var art = new Articles();
art.appendTo(document.querySelector("#ArtikelTab"));
callAPI("LeseArtikelListe",null,"json",function(d){
    for(var i of d){
        callAPI("LeseArtikelMetadaten",i,"json",function(data){
            art.addArticle(new ArticleItem(...data));
            //loadMetadataEditor(...data);
            art.render();
        });
    }
    art.render();
});
callAPI("LeseNutzerRechte",null,"json",function(data){
    if(data.dev){
        startServerDebug();
    }else{
        document.querySelector("#Debugging").style.display = "none";
    }
});
function startServerDebug(){
    var eventSource = new EventSource("/dbg-api");
    var memUsage = document.querySelector(".server-debug-panel .mem-usage .line-graph");
    var cpuUsage = document.querySelector(".server-debug-panel .cpu-usage .line-graph");
    var memGraph = new LineGraph(memUsage);
    var cpuGraph = new LineGraph(cpuUsage);

    eventSource.onmessage = (event) => {
        var data = JSON.parse(event.data);
        console.log(data,memGraph,memUsage);
        document.querySelector(".server-debug-panel .node-v").innerText = "node.js: "+data.versions.node;
        document.querySelector(".server-debug-panel .jag-v").innerText = "jag: "+data.versions.jag;
        document.querySelector(".server-debug-panel .hostname").innerText = data.stats.hostname;
        document.querySelector(".server-debug-panel .arch").innerText = data.stats.arch;
        document.querySelector(".server-debug-panel .os-platform").innerText = data.stats.os + " " + data.stats.platform;
        var memP = ((data.stats.memoryTotal - data.stats.memoryFree)/data.stats.memoryTotal)*100;
        document.querySelector(".server-debug-panel .mem-usage h3").innerText =
            "Memory " + Math.round(memP) + "%";
        memGraph.addData(100-memP);
        document.querySelector(".server-debug-panel .cpu-usage h3").innerText =
            "CPU " + Math.round(data.stats.cpuLoad) + "%";
        cpuGraph.addData(100-data.stats.cpuLoad);
        //var cpuUsage = document.querySelector(".server-debug-panel .mem-usage .line-graph");
        //cpuUsage.innerHTML += "<div style=\"height:" + (100 - data.stats.cpuUsagePercent) + "%\"></div>";
        //document.querySelector(".server-debug-panel").innerHTML = event.data;
    };

    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
}