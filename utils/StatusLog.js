const rdl = require("readline");
const CONFIG = require("./config");

module.exports = class StatusLog{
    constructor(){
        //this.rl = rdl.createInterface()
        this.lineBuffer = [];
        this.msg = "";
        this.spinnerStates = ['◜','◠','◝','◞','◡','◟'];
        this.spinnerState = 0;
        var self = this;
        process.stdout.write("\x1b[?25l");
        this.spinnerInterval = setInterval(function(){
            if(self.lineBuffer.length === 0){
                return;
            }
            var lastItem = self.lineBuffer[self.lineBuffer.length-1];
            self.lineBuffer[self.lineBuffer.length-1] =
                self.spinnerStates[Math.floor(self.spinnerState/2)%self.spinnerStates.length] + lastItem.slice(1);
            self.spinnerState+=1;
            self.writeLineBuffer();
        },1);
    }
    writeLineBuffer(){
        rdl.clearScreenDown(process.stdout);
        var string = "\r"+this.lineBuffer.join("\x1b[0m     \n")+ "\x1b[0m";
        for(var i = 0;i < this.spinnerStates.length;i++){
            string = string.replaceAll(this.spinnerStates[i], "\x1b[32m"+this.spinnerStates[i]+"\x1b[34m");
        }
        process.stdout.write(string);
        rdl.moveCursor(process.stdout, 0, -this.lineBuffer.length+1);
    }
    warn(text){
        if(CONFIG.DEBUG){
            console.warn("\x1b[93m[WARNUNG]\x1b[0m",text);
            return;
        }
        var lastItem = this.lineBuffer[this.lineBuffer.length-1];
        this.lineBuffer[this.lineBuffer.length-1] = "\x1b[93m[WARNUNG]\x1b[0m " + text;
        this.lineBuffer.push(lastItem);
        this.writeLineBuffer();
    }
    error(text){
        if(CONFIG.DEBUG){
            console.error("\x1b[91m[FEHLER]\x1b[0m",text);
            return;
        }
        var lastItem = this.lineBuffer[this.lineBuffer.length-1];
        this.lineBuffer[this.lineBuffer.length-1] = "\x1b[91m[FEHLER]\x1b[0m " + text;
        this.lineBuffer.push(lastItem);
        this.writeLineBuffer();
    }
    async setSpinnerText(text){
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
        if(this.lineBuffer.length > 0){
            this.lineBuffer[this.lineBuffer.length-1] = this.msg;
        }
        this.msg = text;
        if(CONFIG.DEBUG){
            console.log(text);
            return;
        }
        this.lineBuffer.push("  "+text);
        this.writeLineBuffer();
        await sleep(2);
        if(CONFIG.DEBUG){
            await sleep(150);
        }
    }
    stop(){
        clearInterval(this.spinnerInterval);
        rdl.moveCursor(process.stdout, 0, this.lineBuffer.length+2);
        process.stdout.write("\x1b[?25h");
    }
}