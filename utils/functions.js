module.exports = {
    date2ISO:function(string){
        var date = string.split(".").reverse().map(str => parseInt(str, 10));
        date[1]--;
        date[2]++;
        return (new Date(...date)).toISOString().split('T')[0];
    },
    str:function str(string){
        return (typeof string === "string"?string:(string?string+"":""));
    }
}