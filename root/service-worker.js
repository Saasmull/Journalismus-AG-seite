function e(t,e){v1Arr=t.split("."),v2Arr=e.split(".");for(var a=0;a<3;a++){var n=Number(v1Arr[a]),s=Number(v2Arr[a]);if(s<n)return t;if(n<s)return e}return t}function t(){}function o(e,a){try{s.postMessage({type:"setLocalStorageKey",data:{key:e,value:a}})}catch(t){self.clients.matchAll({type:"window"}).then(function(t){t.forEach(function(t){t.postMessage({type:"setLocalStorageKey",data:{key:e,value:a}})})})}}function l(e){try{s.postMessage({type:"getLocalStorageKey",data:{key:e}})}catch(t){self.clients.matchAll({type:"window"}).then(function(t){t.forEach(function(t){t.postMessage({type:"getLocalStorageKey",data:{key:e}})})})}}async function a(){try{var t=await(await fetch("/api/articles.json")).json();o("prevs",JSON.stringify(t))}catch(t){}}function u(t){self.registration.showNotification(t.title,{body:"Besuche unseren neuesten Artikel!",data:{url:"/article/"+t.path+".html"}})}async function n(){try{var t=await(await fetch("/api/articles.json")).json(),e=[];try{l("subs"),e=JSON.parse(f.subs)}catch(t){}var a=[];try{l("prevs"),a=JSON.parse(f.prevs)}catch(t){}for(var n=0;n<e.length;n++)for(var s=t[e[n]],i=a[e[n]],c=s.filter(function(e){return!i.some(function(t){return e.path===t.path})}),r=0;r<c.length;r++)u(c[r]);o("prevs",JSON.stringify(t))}catch(t){}}var f,s,i;["localhost","127.0.0.1"].includes(location.hostname)||(f={},s=0,i="1.0.0",self.addEventListener("install",function(t){t.waitUntil(caches.open(i).then(function(t){return t.addAll(["","/","/index.html","/assets/styles/article.css","/assets/styles/main.css","/assets/scripts/audio-player.js","/assets/scripts/layout.js","/assets/scripts/graph.js"])})),self.skipWaiting()}),self.addEventListener("activate",function(t){t.waitUntil(caches.keys().then(function(t){return Promise.all(t.map(function(t){e(i,t)}))})),t.waitUntil(self.clients.claim())}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(t){return t||fetch(a.request).then(function(e){return caches.open(i).then(function(t){return t.put(a.request,e.clone()),e})}).catch(function(t){if("GET"===a.request.method&&a.request.headers.get("accept").includes("text/html"))return new Response(`
                    <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body>
                            <h1>Offline</h1>
                        </body>
                    </html>
                    `,{headers:{"Content-Type":"text/html"}})})}))}),self.addEventListener("notificationclick",function(e){e.notification.close();try{e.waitUntil(s.navigate(e.notification.data.url))}catch(t){e.waitUntil(clients.matchAll({type:"window"}).then(function(t){return 0<t.length?(t[0].navigate(e.notification.data.url),t[0].focus()):clients.openWindow(e.notification.data.url)}))}}),self.addEventListener("message",function(t){"localStorageData"===t.data.type?f=t.data.data:"setLocalStorageKeyB"===t.data.type||"getLocalStorageKeyB"===t.data.type?f[t.data.data.key]=t.data.data.value:"init"===t.data.type&&(s=t.source)}),a(),setInterval(n,1e4));