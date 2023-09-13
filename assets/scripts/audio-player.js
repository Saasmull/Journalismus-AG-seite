
class AudioPlayer{
    constructor(audio){
        /** @type {HTMLAudioElement} */
        this.audio = audio;
        this.controls = document.createElement("div");
        this.controls.classList.add("audio-player");
        this.controls.innerHTML = "<button class=\"play\">Play</button><input class=\"timeline\" type=\"range\"><span class=\"timestamp\">0:00/0:00</span><button class=\"mute\">Mute</button><input class=\"volume\" type=\"range\">";
        this.audio.parentElement.insertBefore(this.controls,this.audio);
        this.controlElements = {
            playButton:this.controls.querySelector(".play"),
            timeline:this.controls.querySelector(".timeline"),
            timestamp:this.controls.querySelector(".timestamp"),
            muteButton:this.controls.querySelector(".mute"),
            volume:this.controls.querySelector(".volume")
        };
        this.controlElements.muteButton.style.display = "none";
        this.controlElements.volume.style.display = "none";
        this.controlElements.timeline.value = 0;
        this.controlElements.timeline.step = 0.01;
        this.controlElements.playButton.addEventListener("click",()=>{
            if(this.audio.paused){
                this.audio.play();
            }else{
                this.audio.pause();
            }
        });
        this.audio.addEventListener("timeupdate",()=>{
            this.controlElements.timeline.value = this.audio.currentTime;
            this.controlElements.timeline.max = this.audio.duration;
            this.controlElements.timestamp.innerHTML = Math.floor(this.audio.currentTime)+"/"+Math.floor(this.audio.duration);
        })
        this.controlElements.timeline.addEventListener("input",()=>{
            this.audio.currentTime = this.controlElements.timeline.value;
        })
    }
}

var audioTags = document.querySelectorAll("audio");
console.log(audioTags);
for(var i = 0;i < audioTags.length;i++){
    if(!audioTags[i].controls){
        new AudioPlayer(audioTags[i]);
    }
}