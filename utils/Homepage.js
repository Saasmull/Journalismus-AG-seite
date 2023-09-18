const fs = require("fs");
const {marked} = require("marked");

const CONFIG = require("./config");
const Category = require("./Category");
const Article = require("./Article");

/**
 * @param {Category[]} categories Kategorien auf der Homepage
 */
module.exports = class Homepage{
    /**
     * 
     */
    constructor(){
        this.categories = [];
    }

    addCategory(category){
        this.categories.push(category);
    }

    renderHomepage(){
        var categorySections = "<div id=\"content\" class=\"category-container\">\n";
        for(var i = 0;i < this.categories.length;i++){
            categorySections += this.categories[i].renderCategorySection();
        }
        categorySections += "</div>\n";
        var page = CONFIG.BASIC_TEMPLATE
            .replace("<!--CONTENT-->",categorySections);
        return page;
    }
}