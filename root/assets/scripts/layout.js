var PATH=location.pathname.substr(8,location.pathname.length-13),subscribeButton;if(null!==localStorage.getItem("subs"))try{-1!==JSON.parse(localStorage.getItem("subs").indexOf(PATH))&&(subscribeButton=document.getElementById("subscribe"),subscribeButton)&&(subscribeButton.classList.add("subscribed"),subscribeButton.innerHTML="Abonniert")}catch(e){}function subscribeAuthor(e){var t=JSON.parse(localStorage.getItem("subs"))||[];-1===t.indexOf(e)&&(t.push(e),localStorage.setItem("subs",JSON.stringify(t))),"Notification"in window&&Notification.requestPermission().then(function(e){})}function unsubsscribeAuthor(e){var t=JSON.parse(localStorage.getItem("subs"))||[];t.splice(t.indexOf(e),1),localStorage.setItem("subs",JSON.stringify(t))}function toggleSub(e){(e.classList.contains("subscribed")?(e.classList.remove("subscribed"),e.innerHTML="Abonnieren",unsubsscribeAuthor):(e.classList.add("subscribed"),e.innerHTML="Abonniert",subscribeAuthor))(e.getAttribute("data-path"))}var themeButton=document.getElementById("toggle-theme"),currentTheme=!!matchMedia&&matchMedia("(prefers-color-scheme: light)").matches;function setLum(e,t){(currentTheme=e)?(document.documentElement.classList.add("lum"),localStorage.setItem("lum","on"),t&&(themeButton.checked=!1)):(document.documentElement.classList.remove("lum"),localStorage.setItem("lum","off"),t&&(themeButton.checked=!0))}null!==localStorage.getItem("lum")&&(currentTheme="on"===localStorage.getItem("lum")),setLum(currentTheme,!0),themeButton.addEventListener("change",function(){setLum(!currentTheme,!1)}),"serviceWorker"in navigator&&(navigator.serviceWorker.register("/service-worker.js"),navigator.serviceWorker.ready.then(function(sW){sW.active.postMessage({type:"init"}),navigator.serviceWorker.addEventListener("message",function(event){if("syncLocalStorage"===event.data.type){if(event.data.data)for(var key in event.data.data)localStorage.setItem(key,event.data.data[key]);sW.active.postMessage({type:"localStorageData",data:eval("{...localStorage}")})}else"setLocalStorageKey"===event.data.type?(localStorage.setItem(event.data.data.key,event.data.data.value),sW.active.postMessage({type:"setLocalStorageKeyB",data:{key:event.data.data.key,value:event.data.data.value}})):"getLocalStorageKey"===event.data.type&&sW.active.postMessage({type:"getLocalStorageKeyB",data:{key:event.data.data.key,value:localStorage.getItem(event.data.data.key)}})})}));var drawer=document.querySelector("header>nav"),drawerScrim=document.querySelector("header>nav>.scrim"),isDrawerDragging=!1,drawerDragOffset=0,drawerOffset=0;function pointerDown(e){var t,a;e.touches&&(e.clientX=e.touches[0].clientX,e.clientY=e.touches[0].clientY),drawerDragOffset=e.clientX-drawerOffset,(isDrawerDragging=drawer.contains(e.target)||e.clientX<20)?(drawer.classList.remove("open"),drawer.classList.remove("closed"),drawerScrim.style.display="block"):"BUTTON"===e.target.tagName&&(a=e.target.getBoundingClientRect(),t=e.clientX-a.left,a=e.clientY-a.top,e.target.style.backgroundSize="500%",e.target.style.backgroundImage="radial-gradient(circle at "+t+"px "+a+"px,rgba(255,250,250,0.2) 50%,transparent 60%)")}function pointerMove(e){e.touches&&(e.clientX=e.touches[0].clientX,e.clientY=e.touches[0].clientY),isDrawerDragging&&(drawerOffset=Math.min(0,e.clientX-Math.abs(drawerDragOffset)),drawer.style.left=drawerOffset+"px",drawerScrim.style.opacity=1-Math.abs(drawerOffset)/drawer.clientWidth)}function pointerUp(e){isDrawerDragging?(drawerOffset>=drawer.clientWidth/-2?(drawerOffset=0,drawer.classList.add("open"),drawer.classList.remove("closed"),drawer.style.left="0px",drawerScrim.style.display="block"):drawerOffset<drawer.clientWidth/-2&&(drawerOffset=-drawer.clientWidth,drawer.classList.remove("open"),drawer.classList.add("closed"),drawer.style.left=-drawer.clientWidth+"px",drawerScrim.style.display="none"),isDrawerDragging=!1):"BUTTON"===e.target.tagName&&(e.target.style.backgroundImage="radial-gradient(circle at 50% 50%,rgba(255,250,250,0) 500%,transparent 500%)",e.target.style.backgroundSize="100%")}function toggleMenu(){drawer.classList.contains("closed")?(drawerOffset=0,drawer.classList.add("open"),drawer.classList.remove("closed"),drawer.style.left="0px",drawerScrim.style.display="block"):(drawerOffset=-drawer.clientWidth,drawer.style.left=-drawer.clientWidth+"px",drawerScrim.style.display="none",setTimeout(function(){drawer.classList.add("closed")},10)),drawerScrim.style.opacity=1-Math.abs(drawerOffset)/drawer.clientWidth}drawerScrim.addEventListener("click",function(){drawerOffset=-drawer.clientWidth,drawer.style.left=-drawer.clientWidth+"px",drawer.classList.remove("open"),drawer.classList.add("closed"),drawerScrim.style.display="none"}),toggleMenu(),window.addEventListener("touchstart",pointerDown),window.addEventListener("mousedown",pointerDown),window.addEventListener("touchmove",pointerMove),window.addEventListener("mousemove",pointerMove),window.addEventListener("touchend",pointerUp),window.addEventListener("mouseup",pointerUp),window.addEventListener("resize",function(){drawer.classList.contains("closed")&&(drawerOffset=-drawer.clientWidth,drawer.style.left=-drawer.clientWidth+"px")}),window.addEventListener("DOMContentLoaded",function(){var e=document.querySelectorAll("[data-bg-img]");if("IntersectionObserver"in window)for(var a=new IntersectionObserver(function(e){console.log(e,e.length);for(var t=0;t<e.length;t++)console.log(e[t]),e[t].isIntersecting&&(e[t].target.style.backgroundImage="url('"+e[t].target.dataset.bgImg+"')",a.unobserve(e[t].target))},{rootMargin:"100px"}),t=0;t<e.length;t++)a.observe(e[t]);else for(t=0;t<e.length;t++)e[t].style.backgroundImage="url('"+e[t].dataset.bgImg+"')"});var cardElements=document.querySelectorAll("article.card");function updateCardElements(){for(var e=0;e<cardElements.length;e++){var t=!!matchMedia&&matchMedia("screen and (min-width:781px)").matches;1e3<cardElements[e].clientWidth||cardElements[e].clientWidth>window.innerWidth/2&&t?cardElements[e].classList.add("wide"):cardElements[e].classList.remove("wide")}}updateCardElements(),window.addEventListener("resize",updateCardElements);try{var bannerImage=document.querySelector(".banner-image");bannerImage&&window.addEventListener("scroll",function(){var e=window.scrollY||window.pageYOffset;bannerImage.style.backgroundPositionY="calc(45% + "+e/2+"px)"})}catch(e){}function addHoverEffect(r){r.addEventListener("mousemove",function(e){var t=r.getBoundingClientRect(),a=e.clientX-t.left,e=e.clientY-t.top;r.style.backgroundImage="radial-gradient(circle at "+a+"px "+e+"px,var(--bg-color-1-5) 0%,transparent 80%)"},!0),r.addEventListener("mouseleave",function(){r.style.backgroundImage=""},!0)}for(var i=0;i<cardElements.length;i++)addHoverEffect(cardElements[i]);document.addEventListener("wheel",function(e){e.ctrlKey&&e.preventDefault()},{passive:!1}),document.addEventListener("keydown",function(e){!e.ctrlKey||"+"!==e.key&&"-"!==e.key||e.preventDefault()},{passive:!1}),document.addEventListener("touchmove",function(e){void 0!==e.scale&&1!==e.scale&&e.preventDefault()},{passive:!1}),document.addEventListener("dblclick",function(e){e.preventDefault()},{passive:!1});