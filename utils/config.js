
const fs = require("fs");

const CONFIG = module.exports = {
    SITE_NAME:"Journalismus-AG",
    DESCRIPTION:"Wir sind die Journalismus-AG der Heinrich-Büssing-Schule aus Braunschweig. Entdecke spannende Beiträge über Technik, Politik, Sport, Umwelt und unsere Schule!",
    SITE_ROOT:"http://localhost:8080"
};

CONFIG.BASIC_TEMPLATE = fs
    .readFileSync("templates/basic.html","utf-8")
    .replace("<!--SITENAME-->", CONFIG.SITE_NAME);
