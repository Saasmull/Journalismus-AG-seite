
const fs = require("fs");

const CONFIG = module.exports = {
    /** @type {string} Der Website-Name*/
    SITE_NAME:"Journalismus-AG",
    /**@type {string} Die Beschreibung der Website. Sie wird in den `<meta>`-Tags und im JSON-LD fürs SEO genutzt.*/
    DESCRIPTION:"Wir sind die Journalismus-AG der Heinrich-Büssing-Schule aus Braunschweig. Entdecke spannende Beiträge über Technik, Politik, Sport, Umwelt und unsere Schule!",
    /** @type {string} Der URL-Pfad zur Homepage. */
    SITE_ROOT:"http://localhost:8080",
    /** @type {boolean} Ob alle Dateien verkleinert werden sollen. Z.B. ob aus
     * ```css
     * a{
     *      color: red;
     * }
     * ```
     * folgender CSS-Code
     * ```css
     * a{color:red}
     * ```
     * gemacht werden soll.*/
    MINIFY:true,
    /** @type {boolean} Wenn aktiviert, werden z.B. die Kompilierugslogs genauer. */
    DEBUG:false
};

/** @type {string} Die Grundstruktur der Seiten */
CONFIG.BASIC_TEMPLATE = fs
    .readFileSync("templates/basic.html","utf-8")
    .replace("<!--SITENAME-->", CONFIG.SITE_NAME);
