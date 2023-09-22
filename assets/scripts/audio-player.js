
function AudioPlayer(audio){
    /** @type {HTMLAudioElement} */
    this.audio = audio;
    this.controls = document.createElement("div");
    this.controls.classList.add("audio-player");
    this.controls.innerHTML = "<button class=\"play\">Play</button><input aria-label=\"Zu Zeitpunkt springen\" class=\"timeline\" type=\"range\"><span class=\"timestamp\">0:00/0:00</span><button class=\"mute\">Mute</button><input class=\"volume\" type=\"range\">";
    //!TODO compat insertBefore
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

    var self = this;
    this.controlElements.playButton.addEventListener("click",function(){
        if(self.audio.paused){
            self.audio.play();
        }else{
            self.audio.pause();
        }
    });
    this.audio.addEventListener("timeupdate",function(){
        self.controlElements.timeline.value = self.audio.currentTime;
        self.controlElements.timeline.max = self.audio.duration;
        self.controlElements.timestamp.innerHTML = Math.floor(self.audio.currentTime)+"/"+Math.floor(self.audio.duration);
    })
    this.controlElements.timeline.addEventListener("input",function(){
        self.audio.currentTime = self.controlElements.timeline.value;
    })
}

var audioTags = document.querySelectorAll("audio");
for(var i = 0;i < audioTags.length;i++){
    if(!audioTags[i].controls){
        new AudioPlayer(audioTags[i]);
    }
}