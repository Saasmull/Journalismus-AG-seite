var keyArray = ["m","l","g"];
var keyIndex = 0;
var mlgMemeData = [
    {
        audio:"https://www.myinstants.com/media/sounds/mlg-airhorn.mp3",
        image:"https://i.kym-cdn.com/entries/icons/original/000/017/061/air_horn.png",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/x-files-theme-song-copy.mp3",
        image:"https://media.tenor.com/R8CEn82LUQ4AAAAi/illuminati-memes.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/nyan-cat_1.mp3",
        image:"https://raw.githubusercontent.com/gist/KartSriv/3ec0038fbd26cdac8573382dc1cc857e/raw/b62b85e17ba62459c4c2f37e3d6314407d576f9f/nyancat.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/fbi-open-up-sfx.mp3",
        image:"https://gifdb.com/images/high/fbi-open-up-385-x-498-gif-02hpkz2a0fv8nukp.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/2021-04-07-213841761.mp3",
        image:"https://tr.rbxcdn.com/612754266770e117f43232525a16742f/420/420/Image/Png",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/clash-royale-hog-rider.mp3",
        image:"https://media.tenor.com/s2fWpDQjz98AAAAi/weightlifting-hog-rider.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/and-his-name-is-john-cena-1.mp3",
        image:"https://i.makeagif.com/media/9-11-2015/6DpY9y.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/kazoo-kid-has-skills_2t0L0XV.mp3",
        image:"https://pa1.aminoapps.com/7542/8c012b20f4233716edcd9bfd84e7552a38a53746r1-332-332_hq.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/wow-mlg-sound-effect.mp3",
        image:"https://i.kym-cdn.com/photos/images/original/000/983/593/636.gif",
        animation:""
    },
    {
        audio:"https://www.myinstants.com/media/sounds/five-nights-at-freddys-full-scream-sound_2.mp3",
        image:false,
    },
    {
        audio:"https://www.myinstants.com/media/sounds/aaaaaaaa-online-audio-converter_r9waVUO.mp3",
        image:false,
    },
    {
        audio:"https://www.myinstants.com/media/sounds/tyler1-hot-food.mp3",
        image:false,
    },
    {
        audio:"https://www.myinstants.com/media/sounds/oooool.mp3",
        image:false,
    },
    {
        audio:"https://www.myinstants.com/media/sounds/mom-get-the-camera.mp3",
        image:false,
    }
]
class MlgMeme{
    constructor(data){
        this.audio = new Audio(data.audio);
        console.log(this.audio)
        this.element = new Image();
        this.element.style.position = "fixed";
        this.element.style.zIndex = "999";
        this.element.style.minWidth = "200px";
        this.element.style.height = "200px";
        this.element.style.backgroundColor = "transparent !important";
        this.element.style.background = "transparent";
        this.element.style.animation = "shake 200ms linear infinite";
        this.element.style.filter = "none";
        this.element.style.backdropFilter = "none";
        this.src = data.image;
        if(this.src){
            this.element.src = data.image;
        }
        document.body.appendChild(this.element);
    }
    setMemeData(data){
        this.audio.src = data.audio;
        this.src = data.image;
        if(this.src){
            this.element.src = data.image;
        }
    }
    play(){
        try{
            this.audio.play();
        }catch(e){
            console.log(e);
        }
        if(!this.src){
            return;
        }
        this.element.style.left = (Math.random() * (window.innerWidth - this.element.width + 100) - 50) + "px";
        this.element.style.top = (Math.random() * (window.innerHeight - this.element.height + 100) - 50) + "px";
        this.element.style.display = "block";
    }
    stop(){
        this.audio.pause();
        this.audio.currentTime = 0;
        this.element.style.display = "none";
    }
    onReady(callback){
        var self = this;
        function adapter(event){
            callback(event,self);
        }
        this.audio.onended = adapter;
    }
}

var longs = 0;
function getRandomMeme(){
    var index = Math.floor(Math.random() * mlgMemeData.length);
    if(index === 1 || index === 2){
        longs++;
        if(longs > 1){
            return getRandomMeme();
        }
    }else{
        longs-=1;
        longs = Math.max(0,longs);
    }
    return mlgMemeData[index];
}

var memes = [];
for(var i = 0;i < 15;i++){
    memes.push(new MlgMeme(getRandomMeme()));
}
window.addEventListener("keyup",function(event){
    if(event.key === keyArray[keyIndex]){
        keyIndex++;
        if(keyIndex === keyArray.length){
            document.head.innerHTML += "<style id=\"mlg\">@keyframes shake {0% { transform: translate(1px, 1px); }10% { transform: translate(-1px, -2px); }20% { transform: translate(-3px, 0px); }30% { transform: translate(3px, 2px); }40% { transform: translate(1px, -1px); }50% { transform: translate(-1px, 2px); }60% { transform: translate(-3px, 1px); }70% { transform: translate(3px, 1px); }80% { transform: translate(-1px, -1px); }90% { transform: translate(1px, 2px); }100% { transform: translate(1px, -2px); }}"+
            "@keyframes rainbow-bg{0%,100%{background-color:red}8%{background-color:#ff7f00}16%{background-color:#ff0}25%{background-color:#7fff00}33%{background-color:#0f0}41%{background-color:#00ff7f}50%{background-color:#0ff}58%{background-color:#007fff}66%{background-color:#00f}75%{background-color:#7f00ff}83%{background-color:#f0f}91%{background-color:#ff007f}}@keyframes rainbow{0%,100%{color:red!important}8%{color:#ff7f00!important}16%{color:#ff0!important}25%{color:#7fff00!important}33%{color:#0f0!important}41%{color:#00ff7f!important}50%{color:#0ff!important}58%{color:#007fff!important}66%{color:#00f!important}75%{color:#7f00ff!important}83%{color:#f0f!important}91%{color:#ff007f!important}}*{animation:.2s linear infinite rainbow-bg,1.5s linear infinite rainbow}</style>";
            for(var i = 0;i < memes.length;i++){
                setTimeout(memes[i].play.bind(memes[i]),Math.floor(Math.random() * 2000));
                memes[i].onReady(function(event,element){
                    element.stop();
                    if(keyIndex === keyArray.length){
                        setTimeout(function(){
                            if(keyIndex === keyArray.length){
                                element.play.bind(element);
                            }
                        },Math.floor(Math.random() * 5000));
                        element.setMemeData(getRandomMeme());
                        element.play();
                    }
                    
                });
            }
            window.addEventListener("keyup",function(){
                document.querySelector("#mlg").remove();
                keyIndex = 0;
                for(var i = 0;i < memes.length;i++){
                    memes[i].stop();
                }
            },{once:true})
        }
    }
})