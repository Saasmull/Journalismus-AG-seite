var lame = 1;
for(var i = 0;i < 100000000;i++){
    i-=0.5;
    lame += i - 1;
}

var PATH = location.pathname.substr(8,location.pathname.length-13);

function supportsWebp(){
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

function subscribeAuthor(path){
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
function unsubsscribeAuthor(path){
    var subs = JSON.parse(localStorage.getItem("subs"))||[];
    subs.splice(subs.indexOf(path),1);
    localStorage.setItem("subs",JSON.stringify(subs));
}
function toggleSub(element){
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
var themeButton = document.getElementById("toggle-theme");
var currentTheme = matchMedia?matchMedia("(prefers-color-scheme: light)").matches:false;

if(localStorage.getItem("lum")!==null){
    currentTheme = localStorage.getItem("lum")==="on";
}

function setLum(state,set){
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
                })
            }else if(event.data.type === "setLocalStorageKey"){
                localStorage.setItem(event.data.data.key,event.data.data.value);
                sW.active.postMessage({
                    "type":"setLocalStorageKeyB",
                    "data":{
                        "key":event.data.data.key,
                        "value":event.data.data.value
                    }
                })
            }else if(event.data.type === "getLocalStorageKey"){
                sW.active.postMessage({
                    "type":"getLocalStorageKeyB",
                    "data":{
                        "key":event.data.data.key,
                        "value":localStorage.getItem(event.data.data.key)
                    }
                })
            }
        })
    })
}

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
        if(drawerOffset >= drawer.clientWidth / -2) {
            drawerOffset = 0;
            drawer.classList.add("open");
            drawer.classList.remove("closed");
            drawer.style.left = "0px";
            drawerScrim.style.display = "block";
        } else if(drawerOffset < drawer.clientWidth / -2) {
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
    } else {
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

window.addEventListener("DOMContentLoaded",function(){
    var bgImages = document.querySelectorAll("[data-bg-img]");
    /*for(var i = 0;i < bgImages.length;i++){
        var b = new Image();
        b.src = bgImages[i].dataset.bgImg;
        b.addEventListener("loadeddata",function(event){
            var imgs = document.querySelectorAll("[data-bg-img=\""+event.target.src+"\"]");
            for(var j = 0;j < imgs.length;j++){
                imgs[j].style.opacity = 1;
                imgs[j].style.backdropFilter = "invert(0)";
                imgs[j].style.backgroundImage =
                    "url('" + event.target.src + "')";
                if(observer){
                    observer.unobserve(imgs[j]);
                }
            }
        });
    }*/
    if("IntersectionObserver" in window){
        function handleIntersection(entries){
            for(var i = 0;i < entries.length;i++){
                if(entries[i].isIntersecting){
                    entries[i].target.style.opacity = 1;
                    entries[i].target.style.backdropFilter = "invert(0)";
                    entries[i].target.style.backgroundImage =
                        "url('" + (supportsWebp()?entries[i].target.dataset.bgImg:entries[i].target.dataset.bgImg.replace("webp","jpg")) + "')";
                    observer.unobserve(entries[i].target);
                }
            }
        }
        var observer = new IntersectionObserver(
            handleIntersection,
            {"rootMargin":"100px"}
        );
        for(var i = 0;i < bgImages.length;i++){
            observer.observe(bgImages[i]);
        }
    }else{
        for(var i = 0;i < bgImages.length;i++){
            bgImages[i].style.opacity = 1;
            bgImages[i].style.backdropFilter = "invert(0)";
            bgImages[i].style.backgroundImage =
                "url('" + bgImages[i].dataset.bgImg + "')";
        }
    }  
})
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
    if(event.ctrlKey){
        event.preventDefault();
        return;
    }
},{"passive":false});
document.addEventListener("keydown",function(event){
    if(event.ctrlKey && (event.key === "+" || event.key === "-")){
        event.preventDefault();
        return;
    }
},{"passive":false});
document.addEventListener("touchmove",function(event){
    if(event.scale !== undefined && event.scale !== 1){
        event.preventDefault();
        return;
    }
},{"passive":false});
document.addEventListener("dblclick",function(event){
    event.preventDefault();
    return;
},{"passive":false});
