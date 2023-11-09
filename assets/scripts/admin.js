onerror = function(ev){
    //console.log(JSON.stringify(ev));
}

function loadMetadataEditor(articleItem,id,metadata){
    var editorContent = `<div class="metadata-editor"><input class="m-title" type="text" value="${metadata.title||""}"><br>
    <input class="m-id" type="text" value="${id||""}"><br>
    <textarea class="m-description">${metadata.description||""}</textarea></div>
    <div class="tmce"></div>`;
    document.querySelector(".editor-window-content").innerHTML = editorContent;
    document.querySelector(".metadata-editor").addEventListener("keyup",function(ev){
        metadata.title = document.querySelector(".metadata-editor .m-title").value;
        metadata.description = document.querySelector(".metadata-editor .m-description").value;
        articleItem.data = metadata;
        articleItem.render();
        callAPI("SchreibeArtikelMetadaten",{id:id,metadata:metadata});
    })
}
function loadContentEditor(id,content){
    var editorContent = `<textarea class="md-edit"></textarea>`;
    document.querySelector(".editor-window-content").innerHTML = editorContent;
    document.querySelector(".md-edit").value = content;
    document.querySelector(".md-edit").addEventListener("keyup",function(ev){
        callAPI("SchreibeArtikelInhalt",{id:id,content:ev.target.value});
    })
}
document.querySelector("button.editor-window-close").addEventListener("click",toggleEditor);
var tablinks = document.querySelectorAll(".tablink");
var tabcontents = document.querySelectorAll(".tabcontent");
function toggleEditor(){
    document.querySelector("#editor-window").classList.toggle("closed");
    for(var i of tabcontents){
        i.style.overflow = document.querySelector("#editor-window").classList.contains("closed")?"":"hidden";
    }
}
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
        this.render();
    }
    render(){
        var glob = this;
        this.el.innerHTML = `<span class="list-col short">${this.data.title}</span>
        <a class="list-col short" href="/article/${this.id}.html">/article/${this.id}.html</a>
        <span class="list-col long">${this.data.description}</span>
        <span class="list-col short">${this.data.authors.join(",")}</span>
        <button class="action-edit-metadata list-col short first">Metadaten bearbeiten</button>
        <button class="action-edit-content list-col short">Inhalt bearbeiten</button>`;
        this.el.querySelector("button.action-edit-metadata").addEventListener("click",function(){
            loadMetadataEditor(glob,glob.id,glob.data);
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
    req.responseType = responseType || "text";
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
    for(let i of d){
        setTimeout(function(){
            callAPI("LeseArtikelMetadaten",i,"json",function(data){
                art.addArticle(new ArticleItem(...data));
                //loadMetadataEditor(...data);
                art.render();
            })
        },i*500);
    }
    art.render();
});
callAPI("LeseNutzerRechte",null,"json",function(data){
    if(data.dev){
        setTimeout(startServerDebug,1500);
        document.getElementById("restart-server").addEventListener("click",function(){
            callAPI("StarteNeu",null,"text");
        });
    }else{
        document.querySelector("#Debugging").style.display = "none";
    }
});
function loadLogs(){
    callAPI("LeseLogs",null,"text",function(data){
        data = "[\n"+data.replaceAll("\n",",\n");
        data = data.substring(0,data.length-2)+"\n]";
        var logs = JSON.parse(data);
        function log2HTML(log){
            var levels = {
                60:"FATAL",
                50:"ERROR",
                40:"WARN",
                30:"INFO",
                20:"DEBUG",
                10:"TRACE"
            };
            return `<div class="log-entry">
            <span class="date">${(new Date(log.time).valueOf())}</span>&nbsp;
            <span class="level ${(levels[log.level]||"USERLVL").toLowerCase()}">[${(levels[log.level]||"USERLVL")}]</span>&nbsp;
            ${(log.req?
                "<span class=\"http\">HTTP "+log.req.method+"</span> "+log.req.url+" "+log.res.statusCode+"&nbsp;":
                "<span class=\"message\">"+log.msg+"</span>"
            )}
            </div>`;
        }
        for(var i of logs){
            document.querySelector(".server-debug-panel .logs .lines").innerHTML += log2HTML(i);
        }
        document.querySelector("#http-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".http")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
        document.querySelector("#fatal-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".fatal")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
        document.querySelector("#error-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".error")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
        document.querySelector("#warn-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".warn")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
        document.querySelector("#info-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".info")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
        document.querySelector("#debug-show").addEventListener("input", function(ev){
            var logs = document.querySelectorAll(".server-debug-panel .logs .lines .log-entry");
            for(var i of logs){
                if(i.querySelector(".debug")){
                    if(ev.target.checked){
                        i.style.display = "block";
                    }else{
                        i.style.display = "none";
                    }
                }
            }
        });
    });
}
function loadConfig(){
    var configEl = document.querySelector(".server-debug-panel .config-vars .lines");
    callAPI("LeseConfig",null,"json",function(data){
        function addKey(key,value){
            var el = document.createElement("details");
            el.innerHTML = "<summary class=\"key\"></summary><span class=\"value\"></span>";
            el.querySelector(".key").innerText = key;
            el.querySelector(".value").innerText = JSON.stringify(value,null,3);
            el.querySelector(".value").classList.add(typeof value);
            configEl.appendChild(el);
            configEl.innerHTML += "<br>";
        }
        for(var i in data){
            addKey(i,data[i]);
        }
    })

}
function startServerDebug(){
    loadLogs();
    loadConfig();
    var eventSource = new EventSource("/dbg-api");
    var memUsage = document.querySelector(".server-debug-panel .mem-usage .line-graph");
    var cpuUsage = document.querySelector(".server-debug-panel .cpu-usage .line-graph");
    var heapUsage = document.querySelector(".server-debug-panel .heap-usage .line-graph");
    var heapSize = document.querySelector(".server-debug-panel .heap-size .line-graph");
    var memGraph = new LineGraph(memUsage);
    var cpuGraph = new LineGraph(cpuUsage);
    var heapGraph = new LineGraph(heapUsage);
    var heapSizeGraph = new LineGraph(heapSize);

    eventSource.onmessage = (event) => {
        var data = JSON.parse(event.data);
        document.querySelector(".server-debug-panel .node-v").innerText = "node.js: "+data.versions.node;
        document.querySelector(".server-debug-panel .jag-v").innerText = "jag: "+data.versions.jag;
        document.querySelector(".server-debug-panel .hostname").innerText = data.stats.hostname;
        document.querySelector(".server-debug-panel .arch").innerText = data.stats.arch;
        document.querySelector(".server-debug-panel .os-platform").innerText = data.stats.os + " " + data.stats.platform;
        var memP = ((data.stats.memoryTotal - data.stats.memoryFree)/data.stats.memoryTotal)*100;
        document.querySelector(".server-debug-panel .mem-usage h3").innerText =
            "Memory " + Math.round(memP) + "%";
        memGraph.addData(memP);
        document.querySelector(".server-debug-panel .cpu-usage h3").innerText =
            "CPU " + Math.round(data.stats.cpuLoad) + "%";
        cpuGraph.addData(data.stats.cpuLoad);
        document.querySelector(".server-debug-panel .heap-usage h3").innerText =
            "Heap " + Math.round(data.stats.memoryUsage.heapUsed/data.stats.memoryUsage.heapTotal*100) + "%";
        heapGraph.addData(data.stats.memoryUsage.heapUsed/data.stats.memoryUsage.heapTotal*100);
        document.querySelector(".server-debug-panel .heap-size h3").innerText =
            "Heap Size " + Math.round(data.stats.memoryUsage.heapTotal/1024/1024) + "MB";
        heapSizeGraph.addData(data.stats.memoryUsage.heapTotal/200000000*100);
    };

    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
    };
}