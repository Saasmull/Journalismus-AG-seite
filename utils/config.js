
const fs = require("fs");

const CONFIG = module.exports = {
    SITE_NAME:"Blog"
};

CONFIG.BASIC_TEMPLATE = fs
    .readFileSync("templates/basic.html","utf-8")
    .replace("<!--SITENAME-->", CONFIG.SITE_NAME);
