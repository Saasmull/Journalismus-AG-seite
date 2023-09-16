var cardElements = document.querySelectorAll("article.card");

function updateCardElements(){
    for(var i = 0;i < cardElements.length;i++){
        if(cardElements[i].clientWidth > 1000 || cardElements[i].clientWidth > window.innerWidth / 2 && matchMedia("screen and (min-width:781px)").matches){
            cardElements[i].classList.add("wide");
        }else{
            cardElements[i].classList.remove("wide");
        }
    }
}

updateCardElements();
window.addEventListener("resize",updateCardElements);

try{
    var bannerImage = document.querySelector(".banner-image");
    if(bannerImage){
        window.addEventListener("scroll",function(){
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