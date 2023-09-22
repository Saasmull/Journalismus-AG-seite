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

var cardElements = document.querySelectorAll("article.card");

function updateCardElements() {
    for(var i = 0; i < cardElements.length; i++) {
        if(cardElements[i].clientWidth > 1000 || cardElements[i].clientWidth > window.innerWidth / 2 && matchMedia("screen and (min-width:781px)").matches) {
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
        window.addEventListener("scroll",function() {
            bannerImage.style.backgroundPositionY = "calc(45% + " + (window.scrollY / 2) + "px)";
        });
    }
} catch(e) {}


for(let i = 0;i < cardElements.length;i++){
    cardElements[i].addEventListener("mousemove",function(event){
        var rect = cardElements[i].getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        cardElements[i].style.backgroundImage = "radial-gradient(circle at " + x +
        "px " + y + "px,var(--bg-color-1-5) 0%,transparent 80%)";
    },true);
    cardElements[i].addEventListener("mouseleave",function(event){
        cardElements[i].style.backgroundImage = "";
    },true);
}

document.addEventListener("wheel",function(event){
    if(event.ctrlKey){
        event.preventDefault();
        return;
    }
},{passive:false});
document.addEventListener("keydown",function(event){
    if(event.ctrlKey && (event.key === "+" || event.key === "-")){
        event.preventDefault();
        return;
    }
},{passive:false});
document.addEventListener("touchmove",function(event){
    if(event.scale !== undefined && event.scale !== 1){
        event.preventDefault();
        return;
    }
},{passive:false});
document.addEventListener("dblclick",function(event){
    event.preventDefault();
    return;
},{passive:false});
