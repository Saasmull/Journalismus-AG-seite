
module.exports = class Sitemap{
    constructor(){
        this.sites = [];
    }
    addSite(site){
        this.sites.push(site);
    }
    renderSitemap(){
        var sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        sitemap += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
        for(var i = 0;i < this.sites.length;i++){
            sitemap += "<url>\n";
            sitemap += "<loc>" + this.sites[i] + "</loc>\n";
            sitemap += "</url>\n";
        }
        sitemap += "</urlset>";
    }
}