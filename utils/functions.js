module.exports = {
    date2ISO:function(string){
        var date = string.split(".").reverse().map(str => parseInt(str, 10));
        date[1]--;
        date[2]++;
        return (new Date(...date)).toISOString().split('T')[0];
    },
    sortArticles:function(array) {
        return array.sort((a, b) => {
          const dateA = new Date(this.date2ISO(a.metadata.published));
          const dateB = new Date(this.date2ISO(b.metadata.published));
          
          // Compare the dates in descending order
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          
          return 0; // Dates are equal
        });
    },      
    str:function str(string){
        return (typeof string === "string"?string:(string?string+"":""));
    }
}