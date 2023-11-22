if(!(["localhost","127.0.0.1"].includes(location.hostname))){
var localStorage = {};
var mainWindowId = 0;

var cacheVersion = "<!--VERSION-->";
function newestVersions(v1,v2){
    v1Arr = v1.split(".");
    v2Arr = v2.split(".");
    for(var i = 0;i < 3;i++){
        var v1Part = Number(v1Arr[i]);
        var v2Part = Number(v2Arr[i]);
        if(v1Part > v2Part){
            return v1;
        }
        if(v1Part < v2Part){
            return v2;
        }
    }
    return v1;
}

self.addEventListener("install", function (event){
    event.waitUntil(
        caches.open(cacheVersion).then(function(cache){
            return cache.addAll([
                "/",
                "/offline.html",
                "/index.html",
                "/assets/styles/article.css",
                "/assets/styles/main.css",
                "/assets/scripts/audio-player.js",
                "/assets/scripts/layout.js",
                "/assets/scripts/graph.js"
            ]);
        })
    );
    self.skipWaiting();
})

self.addEventListener("activate", function(event){
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.map(function(cacheName){
                    if(newestVersions(cacheVersion,cacheName) !== cacheVersion){
                        //return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch", function(event){
    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || (function(){
                if(navigator.connection && navigator.connection.rtt === 0 && event.request.method === "GET" && event.request.headers.get("accept").includes("text/html")){
                    return caches.match("/offline.html");
                }
                return fetch(event.request).then(function(fetchResponse){
                    return caches.open(cacheVersion).then(function(cache){
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                }).catch(function(error){
                    if(event.request.method === "GET" && event.request.headers.get("accept").includes("text/html")){
                        return caches.match("/offline.html");
                    }
                });
            })()
        })
    );
})

self.addEventListener("notificationclick", function(event){
    event.notification.close();
    try{
        event.waitUntil(mainWindowId.navigate(event.notification.data.url));
    }catch(e){
        event.waitUntil(
            clients.matchAll({type: "window",}).then(function(clientList){
                if(clientList.length > 0){
                    clientList[0].navigate(event.notification.data.url);
                    return clientList[0].focus();
                }
                return clients.openWindow(event.notification.data.url);
            }
        ));
    }
});

self.addEventListener("message",function(event){
    if(event.data.type === "localStorageData"){
        localStorage = event.data.data;
    }else if(event.data.type === "setLocalStorageKeyB"){
        localStorage[event.data.data.key] = event.data.data.value;
    }else if(event.data.type === "getLocalStorageKeyB"){
        localStorage[event.data.data.key] = event.data.data.value;
    }else if(event.data.type === "init"){
        mainWindowId = event.source;
    }
});

function syncLocalStorage(){
    /*try{
        mainWindowId.postMessage({type:"syncLocalStorage",data:localStorage});
    }catch(e){
        self.clients.matchAll({type: "window",}).then(function(clients){
            clients.forEach(function(client){
                client.postMessage({type:"syncLocalStorage",data:localStorage});
            });
        });
    }*/
}
function setLocalStorageKey(key,value){
    try{
        mainWindowId.postMessage({type:"setLocalStorageKey",data:{key,value}});
    }catch(e){
        self.clients.matchAll({type: "window",}).then(function(clients){
            clients.forEach(function(client){
                client.postMessage({type:"setLocalStorageKey",data:{key,value}});
            });
        });
    }
}
function getLocalStorageKey(key){
    try{
        mainWindowId.postMessage({type:"getLocalStorageKey",data:{key}});
    }catch(e){
        self.clients.matchAll({type: "window",}).then(function(clients){
            clients.forEach(function(client){
                client.postMessage({type:"getLocalStorageKey",data:{key}});
            });
        });
    }
}
//setInterval(syncLocalStorage,5000);

async function hideNotifications(){
    try{
        var response = await fetch("/api/articles.json");
        var data = await response.json();
        setLocalStorageKey("prevs", JSON.stringify(data));
        //localStorage["prevs"] = JSON.stringify(data);
    }catch(e){}
}
hideNotifications();

function showArticleNotification(article){
    self.registration.showNotification(article.title,{
        body:"Besuche unseren neuesten Artikel!",
        data:{
            url:"/article/"+article.path+".html"
        }
    });
}

async function fetchArticles(){
    try{
        var response = await fetch("/api/articles.json");
        var data = await response.json();
        var subs = [];
        try{
            getLocalStorageKey("subs");
            subs = JSON.parse(localStorage["subs"]);
        }catch(e){}
        var prevs = [];
        try{
            getLocalStorageKey("prevs");
            prevs = JSON.parse(localStorage["prevs"]);
        }catch(e){}
        for(var i = 0;i < subs.length;i++){
            var allArticles = data[subs[i]];
            var prevArticles = prevs[subs[i]];
            var newArticles = allArticles.filter(function(item){
                return !prevArticles.some(function(item2){
                    return item.path === item2.path;
                });
            });
            for(var j = 0;j < newArticles.length;j++){
                showArticleNotification(newArticles[j]);
            }
        }
        setLocalStorageKey("prevs", JSON.stringify(data));
        //localStorage["prevs"] = JSON.stringify(data);
    }catch(e){
    }
}

setInterval(fetchArticles,1000 * 10);
}