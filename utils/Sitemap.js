
const CONFIG = require("./config");

module.exports = class Sitemap{
    constructor(root){
        this.root = root;
        this.sites = [];
    }
    addSite(site){
        this.sites.push(site);
    }
    renderSitemap(){
        var sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + CONFIG.BREAK;
        sitemap += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + CONFIG.BREAK;
        for(var i = 0;i < this.sites.length;i++){
            sitemap += CONFIG.INDENT + "<url>" + CONFIG.BREAK;
            sitemap += CONFIG.INDENT + CONFIG.INDENT + "<loc>" + this.root + this.sites[i] + "</loc>" + CONFIG.BREAK;
            sitemap += CONFIG.INDENT + CONFIG.INDENT + "<lastmod>" + new Date().toISOString().split("T")[0] + "</lastmod>" + CONFIG.BREAK;
            sitemap += CONFIG.INDENT + "</url>" + CONFIG.BREAK;
        }
        sitemap += "</urlset>";
        return sitemap;
    }
}