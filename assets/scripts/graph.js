function LineGraph(element,maxDataPoints=25){
    this.element = element;
    this.xAxis = {
        label: ""
    };
    this.yAxis = {
        label: "",
        min: 0,
        max: 100
    };
    this.maxDataPoints = maxDataPoints;
    this.dataset = Array(this.maxDataPoints);
    for(var i = 0;i < this.maxDataPoints;i++){
        this.dataset[i] = null;
    }
    this.render();
}
LineGraph.prototype.addData = function(data){
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
}
LineGraph.prototype.render = function(){
    var width = this.element.clientWidth;
    var height = this.element.clientHeight;
    this.element.innerHTML = "";
    for(var i = 0;i < this.yAxis.max;i += 10){
        var y = ((this.yAxis.max-i)/this.yAxis.max)*height;
        var label = document.createElement("div");
        label.classList.add("label");
        label.style.position = "absolute";
        label.style.left = "0";
        label.style.top = y + "px";
        label.style.width = "100%";
        label.style.height = "1px";
        label.style.backgroundColor = "#777";
        label.style.color = "#777";
        label.style.textAlign = "right";
        label.style.paddingRight = "8px";
        label.style.fontSize = "12px";
        label.style.fontFamily = "monospace";
        label.style.lineHeight = "1";
        label.style.transform = "translateY(50%)";
        label.style.opacity = "0.7";
        label.innerText = i;
        this.element.appendChild(label);
    }
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
        area.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr=#330000FF,endColorstr=#330000FF)";
        area.style.left = x1 + "px";
        area.style.top = "0";
        area.style.width = x2 - x1 + "px";
        area.style.height = height + "px";
        area.style.clipPath = "polygon(0 " + (y1+1) + "px, 100% " + (y2+1) + "px, 100% 100%, 0 100%)";
        area.style.clip = "polygon(0 " + (y1+1) + "px, 100% " + (y2+1) + "px, 100% 100%, 0 100%)";
        area.style.opacity = "0.2";
        this.element.appendChild(area);

        var line = document.createElement("div");
        line.classList.add("line");
        line.style.zIndex = "10";
        line.style.position = "absolute";
        line.style.backgroundColor = "var(--color-primary)";
        line.style.left = x1 + "px";
        line.style.top = y1 + "px";
        line.style.width = length + "px";
        line.style.borderRadius = "2px";
        line.style.height = "1px";
        line.style.transform = "rotate("+angle+"rad)";
        line.style.transformOrigin = "0% 0%";
        //line.style.msTransformOrigin = "0% 0%";
        line.style.filter =
            "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + Math.cos(angle) + ", M12=" + -Math.sin(angle) + ", M21=" + Math.sin(angle) + ", M22=" + Math.cos(angle) + ")" +
            "progid:DXImageTransform.Microsoft.BasicImage(rotation=1, mirror=1, enabled=true, sizingMethod='crop') " +
            "progid:DXImageTransform.Microsoft.Alpha(Opacity=0, FinishOpacity=100, Style=1, StartX=0, StartY=" + (y1 + 1) + ", FinishX=0, FinishY=" + (y2 + 1) + ")";
        //line.style.boxShadow = "0 2px 3px 0 var(--color-primary)";
        this.element.appendChild(line);
        
    }
    var self = this;
    setTimeout(function(){
        self.render();
    },500);
}