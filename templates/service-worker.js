var localStorage = {};
var mainWindowId = 0;

self.addEventListener("install", function (e){
    e.waitUntil(
        //Add here all the files which are needed that your PWA can run offline:
        caches.open("static-test").then(cache => {
            return cache.addAll([
                "/index.html"
            ]);
        })
    );
})
self.addEventListener("fetch", function (e){
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
})

self.addEventListener("message",function(event){
    if(event.data.type === "localStorageData"){
        localStorage = event.data.data;
        console.log("Synced!");
    }else if(event.data.type === "init"){
        mainWindowId = event.source;
    }
});

function syncLocalStorage(){
    console.log("Sync requesting...");
    mainWindowId.postMessage({type:"getLocalStorage"});
    self.clients.matchAll().then(clients => {
        console.log(clients);
        clients.forEach(client => {
            console.log(client);
            client.postMessage({type:"getLocalStorage"});
        });
    });
}

setInterval(syncLocalStorage,1000);

async function fetchArticles(){
    try{
        console.log("fetch");
        var response = await fetch("/api/articles.json");
        var data = await response.json();
        console.log(data,localStorage);
        var subs = JSON.parse(localStorage["subs"])||[];
        console.log(data,subs);
        for(var i = 0;i < subs.length;i++){
            var article = data[subs[i]][0];
            console.log(article);
            self.registration.showNotification(article.title,{
                body:"Besuche unseren neuesten Artikel!"
            });
        }
    }catch(e){}
}

setInterval(fetchArticles,1000 * 10);