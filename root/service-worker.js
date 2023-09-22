var localStorage = {};
var mainWindowId = 0;

self.addEventListener("install", function (event){
    event.waitUntil(
        //Add here all the files which are needed that your PWA can run offline:
        caches.open("static-test").then(function(cache){
            return cache.addAll([
                "/index.html"
            ]);
        })
    );
})

self.addEventListener("activate", function(event){
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event){
    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || fetch(event.request);
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