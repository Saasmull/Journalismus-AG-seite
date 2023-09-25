var keyArray = ["m","l","g"];
var keyIndex = 0;
window.addEventListener("keyup",function(event){
    if(event.key === keyArray[keyIndex]){
        keyIndex++;
        if(keyIndex === keyArray.length-1){
            document.head.innerHTML += "<style>@keyframes rainbow-bg{0%,100%{background-color:red}8%{background-color:#ff7f00}16%{background-color:#ff0}25%{background-color:#7fff00}33%{background-color:#0f0}41%{background-color:#00ff7f}50%{background-color:#0ff}58%{background-color:#007fff}66%{background-color:#00f}75%{background-color:#7f00ff}83%{background-color:#f0f}91%{background-color:#ff007f}}@keyframes rainbow{0%,100%{color:red!important}8%{color:#ff7f00!important}16%{color:#ff0!important}25%{color:#7fff00!important}33%{color:#0f0!important}41%{color:#00ff7f!important}50%{color:#0ff!important}58%{color:#007fff!important}66%{color:#00f!important}75%{color:#7f00ff!important}83%{color:#f0f!important}91%{color:#ff007f!important}}*{animation:.2s linear infinite rainbow-bg,1.5s linear infinite rainbow}</style>";
        }
    }
})