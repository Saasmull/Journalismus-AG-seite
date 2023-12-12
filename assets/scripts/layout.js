var animatingLoad = false;
var WK = !!window.onwebkitmouseforceup || !!window.SVGTRefElement;
if(WK){
    console.warn("Es könnte in Safari etwas verbuggt werden...");
}
var pwa = false;

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
    navigator.serviceWorker.ready.then(function(sW){
        sW.active.postMessage({
            "type":"init"
        });
        navigator.serviceWorker.addEventListener("message",function(event){
            if(event.data.type === "syncLocalStorage"){
                if(event.data.data){
                    for(var key in event.data.data){
                        localStorage.setItem(key,event.data.data[key]);
                    }
                }
                sW.active.postMessage({
                    "type":"localStorageData",
                    "data":eval("{...localStorage}")
                });
            }else if(event.data.type === "setLocalStorageKey"){
                localStorage.setItem(event.data.data.key,event.data.data.value);
                sW.active.postMessage({
                    "type":"setLocalStorageKeyB",
                    "data":{
                        "key":event.data.data.key,
                        "value":event.data.data.value
                    }
                });
            }else if(event.data.type === "getLocalStorageKey"){
                sW.active.postMessage({
                    "type":"getLocalStorageKeyB",
                    "data":{
                        "key":event.data.data.key,
                        "value":localStorage.getItem(event.data.data.key)
                    }
                });
            }
        });
    });
    navigator.serviceWorker.getRegistrations().then(function(registrations){
        for(var i = 0;i < registrations.length;i++) {
            if(!registrations[i].active && registrations[i] !== navigator.serviceWorker.controller) {
                registrations[i].unregister();
            }
        }
    });
}

if("querySelector" in document){
    var drawer = document.querySelector("header>nav");
    var drawerScrim = document.querySelector("header>nav>.scrim");
    var isDrawerDragging = false;
    var drawerDragOffset = 0;
    var drawerOffset = 0;

    drawerScrim.addEventListener("click",function() {
        drawerOffset = -drawer.clientWidth;
        drawer.style.left = -drawer.clientWidth + "px";
        //!TODO compat ClassList.prototype
        drawer.classList.remove("open");
        drawer.classList.add("closed");
        drawerScrim.style.display = "none";
    });

    function pointerDown(event) {
        if(event.touches) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
        }
        drawerDragOffset = event.clientX - drawerOffset;
        isDrawerDragging = drawer.contains(event.target) || event.clientX < 20;
        if(isDrawerDragging) {
            drawer.classList.remove("open");
            drawer.classList.remove("closed");
            drawerScrim.style.display = "block";
        }else if(event.target.tagName === "BUTTON"){
            var rect = event.target.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            event.target.style.backgroundSize = "500%";
            event.target.style.backgroundImage = "radial-gradient(circle at " + x + "px " +
                y + "px,rgba(255,250,250,0.2) 50%,transparent 60%)";
        }
    }

    function pointerMove(event) {
        if(event.touches) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
        }
        if(isDrawerDragging) {
            drawerOffset = Math.min(0,event.clientX - Math.abs(drawerDragOffset));
            drawer.style.left = drawerOffset + "px";
            drawerScrim.style.opacity = 1 - Math.abs(drawerOffset) / drawer.clientWidth;
        }
    }

    function pointerUp(event) {
        if(isDrawerDragging) {
            if(drawerOffset >= drawer.clientWidth / -2){
                drawerOffset = 0;
                drawer.classList.add("open");
                drawer.classList.remove("closed");
                drawer.style.left = "0px";
                drawerScrim.style.display = "block";
            }else if(drawerOffset < drawer.clientWidth / -2){
                drawerOffset = -drawer.clientWidth;
                drawer.classList.remove("open");
                drawer.classList.add("closed");
                drawer.style.left = -drawer.clientWidth + "px";
                drawerScrim.style.display = "none";
            }
            isDrawerDragging = false;
        }else if(event.target.tagName === "BUTTON"){
            event.target.style.backgroundImage =
                "radial-gradient(circle at 50% 50%,rgba(255,250,250,0) 500%,transparent 500%)";
            event.target.style.backgroundSize = "100%";
        }
    }

    function toggleMenu(){
        if(drawer.classList.contains("closed")) {
            drawerOffset = 0;
                drawer.classList.add("open");
                drawer.classList.remove("closed");
                drawer.style.left = "0px";
                drawerScrim.style.display = "block";
        }else{
            drawerOffset = -drawer.clientWidth;
            drawer.style.left = -drawer.clientWidth + "px";
            drawerScrim.style.display = "none";
            setTimeout(function(){
                drawer.classList.add("closed");
            },10);
        }
        drawerScrim.style.opacity = 1 - Math.abs(drawerOffset) / drawer.clientWidth;
    }
    toggleMenu();

    window.addEventListener("touchstart",pointerDown);
    window.addEventListener("mousedown",pointerDown);

    window.addEventListener("touchmove",pointerMove);
    window.addEventListener("mousemove",pointerMove);

    window.addEventListener("touchend",pointerUp);
    window.addEventListener("mouseup",pointerUp);

    window.addEventListener("resize",function() {
        if(drawer.classList.contains("closed")) {
            drawerOffset = -drawer.clientWidth;
            drawer.style.left = -drawer.clientWidth + "px";
        }
    });
}

function main(firstLoad){
    var PATH = location.pathname.substr(8,location.pathname.length-13);

    supportsWebp = function supportsWebp(){
        var can = document.createElement("canvas");
        if(!!(can.getContext && can.getContext("2d") && can.toDataURL)){
            return can.toDataURL("image/webp").indexOf("data:image/webp") == 0;
        }
        return false;
    }

    if(localStorage.getItem("subs")!==null){
        try{
            if(JSON.parse(localStorage.getItem("subs").indexOf(PATH)) !== -1){
                var subscribeButton = document.getElementById("subscribe");
                if(subscribeButton){
                    subscribeButton.classList.add("subscribed");
                    subscribeButton.innerHTML = "Abonniert";
                }
            }
        }catch(e){}
    }

    subscribeAuthor = function subscribeAuthor(path){
        var subs = JSON.parse(localStorage.getItem("subs"))||[];
        if(subs.indexOf(path) === -1){
            subs.push(path);
            localStorage.setItem("subs",JSON.stringify(subs));
        }
        // Check if the Notification API is available in the browser
        if ("Notification" in window) {
            // Request permission to show notifications
            Notification.requestPermission().then(function(permission){
                if (permission === "granted") {
                    // Permission has been granted, you can show notifications
                    //localStorage.setItem("subs","[\"sml\"]");
                }
            });
        }
    }
    unsubsscribeAuthor = function unsubsscribeAuthor(path){
        var subs = JSON.parse(localStorage.getItem("subs"))||[];
        subs.splice(subs.indexOf(path),1);
        localStorage.setItem("subs",JSON.stringify(subs));
    }
    toggleSub = function toggleSub(element){
        if(element.classList.contains("subscribed")){
            element.classList.remove("subscribed");
            element.innerHTML = "Abonnieren";
            unsubsscribeAuthor(element.getAttribute("data-path"));
        }else{
            element.classList.add("subscribed");
            element.innerHTML = "Abonniert";
            subscribeAuthor(element.getAttribute("data-path"));
        }
    }

    if("URLSearchParams" in window && "currentScript" in document){
        var themeButton = document.getElementById("toggle-theme");
        var currentTheme = matchMedia?matchMedia("(prefers-color-scheme: light)").matches:false;

        if(localStorage.getItem("lum")!==null){
            currentTheme = localStorage.getItem("lum")==="on";
        }
        setLum = function setLum(state,set){
            currentTheme = state;
            if(state){
                document.documentElement.classList.add("lum");
                localStorage.setItem("lum","on");
                if(set){
                    themeButton.checked = false;
                }
            }else{
                document.documentElement.classList.remove("lum");
                localStorage.setItem("lum","off");
                if(set){
                    themeButton.checked = true;
                }
            }
        }
        setLum(currentTheme,true);
        themeButton.addEventListener("change",function(){
            setLum(!currentTheme,false);
        });
    }

    
    if("querySelector" in document){
        function init(){
            function navigateTo(targetURL,isBack){
                console.log(targetURL);
                if(URL && (new URL(targetURL)).hostname !== location.hostname){
                    return;
                }
                event.preventDefault();
                if((URL && (new URL(targetURL)).pathname === location.pathname) || (location.pathname === "/index.html" && targetURL.endsWith("/index.html"))){
                    return;
                }
                var tr = (["localhost","127.0.0.1"]).includes(location.hostname);
                var xhr = new XMLHttpRequest();
                xhr.open("GET", targetURL, true);
                if(!tr){
                    document.querySelector("progress").style.display = "block";
                    xhr.onprogress = function(ev){
                        var progress = (ev.loaded/(ev.total||20000)) * 100;
                        document.querySelector("progress").value = progress;
                    }
                }
                xhr.onload = function(ev){
                    console.log(animatingLoad,xhr.readyState,xhr.status)
                    if(!animatingLoad && xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 303)){
                        animatingLoad = true;
                        if(tr){
                            var oldMain = document.querySelector("main");
                            var dP = new DOMParser();
                            var doc = dP.parseFromString(xhr.responseText,"text/html");
                            var newMain = document.createElement("main");
                            newMain.classList.add("new-main");
                            newMain.style.top = 60-document.querySelector("html").scrollTop+"px";
                            newMain.innerHTML = doc.querySelector("main").innerHTML;
                            document.body.insertBefore(newMain, oldMain);
                            oldMain.classList.add("main-nav-out");
                            newMain.classList.add("main-nav-in");
                            var tID = setTimeout(function(){
                                oldMain.remove();
                                newMain.classList.remove("new-main");
                                newMain.classList.remove("main-nav-in");
                                if(targetURL.includes("/article/")){
                                    document.head.appendChild(doc.querySelector(".articleStyles"));
                                }else{
                                    var articleStyles = document.querySelector(".articleStyles");
                                    if(articleStyles){
                                        articleStyles.remove();
                                    }
                                }
                                document.title = doc.title||"";
                                if(isBack){
                                    history.back();
                                }else{
                                    history.replaceState("", document.title, targetURL);
                                }
                                animatingLoad = false;
                                main(false);
                            },700);
                        }else{
                            document.querySelector("progress").value = 100;
                            setTimeout(function(){
                                document.querySelector("progress").style.display = "none";
                                window.location.href = targetURL;
                            },200);
                        }
                    }
                }
                xhr.send();
            }
            pwa = matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)").matches;
            document.documentElement.style.overscrollBehavior = pwa?"contain":"auto";
            if("MediaQueryListEvent" in window){
                matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)").addEventListener("change",function(ev){
                    pwa = ev.matches;
                    document.documentElement.style.overscrollBehavior = pwa?"contain":"auto";
                });
            }
            /*if(pwa){
                var aLinks = document.querySelectorAll("a");
                for(var i = 0;i < aLinks.length;i++){
                    aLinks[i].addEventListener("click",function(event){
                        var targetURL = "";
                        for(var i = 0;i < aLinks.length;i++){
                            if(aLinks[i].contains(event.target)){
                                targetURL = aLinks[i].href;
                                break;
                            }
                        }
                        navigateTo(targetURL,false);
                    });
                }
                navigation.addEventListener("navigate",function(ev){
                    console.log(ev);
                    if(!ev.userInitiated || !ev.canIntercept){
                        return;
                    }
                    navigateTo(ev.destination.url,false);
                });
            }*/
            window.addEventListener("contextmenu", function(event){
                if(false && pwa){
                    event.preventDefault();
                    document.querySelector(".context-menu").style.display = "block";
                    document.querySelector(".context-menu").style.left = event.clientX + "px";
                    document.querySelector(".context-menu").style.top = event.clientY + "px";
                    console.log(event,window.getSelection(),event.target.contains(window.getSelection().focusNode));
                    var selectedText = window.getSelection().toString();
                    var selection = getSelection();
      
                    if (selection.rangeCount > 0) {
                        var range = selection.getRangeAt(0);
                        
                        // Check if the click coordinates are within the bounds of the selected text
                        if (range.getBoundingClientRect().left <= event.clientX &&
                            range.getBoundingClientRect().right >= event.clientX &&
                            range.getBoundingClientRect().top <= event.clientY &&
                            range.getBoundingClientRect().bottom >= event.clientY) {
                            //
                        }
                    }
                }
            });
            var bgImages = document.querySelectorAll("[data-bg-img]");
            if("Image" in window && "dataset" in HTMLElement.prototype){
                var imgTs = {};
                function loadImg(bgImg,i){
                    if(i >= 5){
                        setTimeout(function(){
                            loadImg(bgImg, 0)
                        },700);
                        return;
                    }
                    imgTs[bgImg.dataset.bgImg] = new Image();
                    imgTs[bgImg.dataset.bgImg].decoding = "async";
                    imgTs[bgImg.dataset.bgImg].src = bgImg.dataset.bgImg;
                    imgTs[bgImg.dataset.bgImg].dataset.bgImg = bgImg.dataset.bgImg;
                    imgTs[bgImg.dataset.bgImg].onload = function(e){
                        var loadedImgs = document.querySelectorAll("[data-bg-img=\""+e.target.dataset.bgImg+"\"]");
                        for(var i = 0;i < loadedImgs.length;i++){
                            loadedImgs[i].style.opacity = 1;
                            loadedImgs[i].style.backdropFilter = "invert(0)";
                            loadedImgs[i].style.backgroundImage = "url('" + e.target.dataset.bgImg + "')";
                        }
                    }
                }
                for(var i = 0;i < bgImages.length;i++){
                    if(!imgTs[bgImages[i].dataset.bgImg]){
                        if(bgImages[i].clientWidth < 720 && bgImages[i].dataset.bgImg.startsWith("/assets/images/") &&
                            !bgImages[i].dataset.bgImg.startsWith("/assets/images/mobile/")){
                            bgImages[i].dataset.bgImg = bgImages[i].dataset.bgImg.replace("/images/","/images/mobile/");
                        }
                        loadImg(bgImages[i], i);
                    }
                }
            }else{
                for(var i = 0;i < bgImages.length;i++){
                    bgImages[i].style.opacity = 1;
                    bgImages[i].style.backdropFilter = "invert(0)";
                    bgImages[i].style.backgroundImage =
                        "url('" + bgImages[i].getAttribute("data-bg-img") + "')";
                }
            }  
        }
        window.addEventListener("DOMContentLoaded",init);
        if(!firstLoad){
            init();
        }
        var cardElements = document.querySelectorAll("article.card");

        function updateCardElements() {
            for(var i = 0; i < cardElements.length; i++) {
                var mediaQuery = matchMedia?matchMedia("screen and (min-width:781px)").matches:false;
                if(cardElements[i].clientWidth > 1000 ||
                        cardElements[i].clientWidth > window.innerWidth / 2 && mediaQuery) {
                    cardElements[i].classList.add("wide");
                } else {
                    cardElements[i].classList.remove("wide");
                }
            }
        }

        updateCardElements();
        window.addEventListener("resize",updateCardElements);

        try {
            var bannerImage = document.querySelector(".banner-image");
            if(bannerImage) {
                window.addEventListener("scroll",function(){
                    var scrolled = window.scrollY || window.pageYOffset;
                    bannerImage.style.backgroundPositionY = "calc(45% + " + (scrolled / 3) + "px)";
                });
            }
        } catch(e) {}

        function addHoverEffect(element){
            element.addEventListener("mousemove",function(event){
                var rect = element.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;
                element.style.backgroundImage = "radial-gradient(circle at " + x +
                "px " + y + "px,var(--bg-color-1-5) 0%,transparent 80%)";
            },true);
            element.addEventListener("mouseleave",function(){
                element.style.backgroundImage = "";
            },true);
        }
        for(var i = 0;i < cardElements.length;i++){
            addHoverEffect(cardElements[i]);
        }

        document.addEventListener("wheel",function(event){
            if(pwa && event.ctrlKey){
                event.preventDefault();
                return;
            }
        },{"passive":false});
        document.addEventListener("keydown",function(event){
            if(pwa &&event.ctrlKey && (event.key === "+" || event.key === "-")){
                event.preventDefault();
                return;
            }
        },{"passive":false});
        document.addEventListener("touchmove",function(event){
            if(pwa && event.scale !== undefined && event.scale !== 1){
                event.preventDefault();
                return;
            }
        },{"passive":false});
        document.addEventListener("dblclick",function(event){
            if(pwa){
                event.preventDefault();
                return;
            }
        },{"passive":false});
    }
}
main(true);