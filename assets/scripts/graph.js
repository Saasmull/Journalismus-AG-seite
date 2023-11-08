class LineGraph{
    constructor(element){
        this.element = element;
        this.xAxis = {
            label: ""
        };
        this.yAxis = {
            label: "",
            min: 0,
            max: 100
        };
        this.maxDataPoints = 25;
        this.dataset = Array(this.maxDataPoints).fill(null);
    }
    addData(data){
        if(typeof data !== "number"){
            for(var i = 0;i < data.length;i++){
                this.addData(data[i]);
            }
            return;
        }
        this.dataset.push(data);
        if(this.dataset.length > this.maxDataPoints){
            this.dataset.shift();
        }
        this.render();
    }
    render(){
        var width = this.element.clientWidth;
        var height = this.element.clientHeight;
        this.element.innerHTML = "";
        for(var i = 0;i < this.dataset.length - 1;i++){
            var data = this.dataset[i];
            if(data === null){
                continue;
            }
            var x1 = i*(width/(this.maxDataPoints-1));
            var y1 = ((this.yAxis.max-data)/this.yAxis.max)*height;
            var x2 = (i+1)*(width/(this.maxDataPoints-1));
            var y2 = ((this.yAxis.max-this.dataset[i+1])/this.yAxis.max)*height;
            var length = Math.sqrt(Math.pow(x2 - x1,2)+Math.pow(y2 - y1,2));
            var angle = Math.atan2(y2 - y1,x2 - x1);

            var area = document.createElement("div");
            area.classList.add("area");
            area.style.position = "absolute";
            area.style.backgroundImage =
                "linear-gradient(to bottom, var(--color-primary) 70%, transparent)";
            area.style.left = x1 + "px";
            area.style.top = "0";
            area.style.width = x2 - x1 + "px";
            area.style.height = height + "px";
            area.style.transformOrigin = "0% 0%";
            area.style.clipPath = "polygon(0 " + (y1+1) + "px, 100% " + (y2+1) + "px, 100% 100%, 0 100%)";
            area.style.opacity = "0.2";
            this.element.appendChild(area);

            var line = document.createElement("div");
            line.classList.add("line");
            line.style.position = "absolute";
            line.style.backgroundColor = "var(--color-primary)";
            line.style.left = x1 + "px";
            line.style.top = y1 + "px";
            line.style.width = length + 1 + "px";
            line.style.borderRadius = "2px";
            line.style.height = "1px";
            line.style.transform = "rotate("+angle+"rad)";
            line.style.transformOrigin = "0% 0%";
            //line.style.boxShadow = "0 2px 3px 0 var(--color-primary)";
            this.element.appendChild(line);
        }
    }
}