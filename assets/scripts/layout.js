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
    }
    drawerDragOffset = event.clientX - drawerOffset;
    isDrawerDragging = drawer.contains(event.target) || event.clientX < 20;
    if(isDrawerDragging) {
        drawer.classList.remove("open");
        drawer.classList.remove("closed");
        drawerScrim.style.display = "block";
    }
}

function pointerMove(event) {
    if(event.touches) {
        event.clientX = event.touches[0].clientX;
    }
    if(isDrawerDragging) {
        drawerOffset = Math.min(0,event.clientX - Math.abs(drawerDragOffset));
        drawer.style.left = drawerOffset + "px";
        drawerScrim.style.opacity = 1 - Math.abs(drawerOffset) / drawer.clientWidth;
    }
}

function pointerUp() {
    console.log("UP");
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

/*for(let i = 0;i < cardElements.length;i++){
    cardElements[i].addEventListener("mouseover",(event)=>{
        console.log(event);
        cardElements[i].style.backgroundImage = "radial-gradient(circle,black 25%,transparent 100%)";
    });
}*/

document.addEventListener("wheel",function(event){
    if(event.ctrlKey){
        event.preventDefault();
        return;
    }
},{passive:false});
document.addEventListener("touchmove",function(event){
    if(event.scale !== 1){
        event.preventDefault();
        return;
    }
},{passive:false});
document.addEventListener("dblclick",function(event){
    event.preventDefault();
    return;
},{passive:false});
