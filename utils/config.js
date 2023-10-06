const os = require("os");
const fs = require("fs");

const CONFIG = module.exports = {
    /** @type {boolean} Ob der Code auf dem Server läuft. */
    IS_SERVER:(os.hostname()==="sponsor01"),
    /** @type {number} Der Port auf dem der Node.js-Server läuft. */
    PORT:8080,
    /** @type {string} Der Website-Name*/
    SITE_NAME:"Journalismus-AG",
    /**@type {string} Die Beschreibung der Website. Sie wird in den `<meta>`-Tags und im JSON-LD fürs SEO genutzt.*/
    DESCRIPTION:"Wir sind die Journalismus-AG der Heinrich-Büssing-Schule aus Braunschweig. Entdecke spannende Beiträge über Technik, Politik, Sport, Umwelt und unsere Schule!",
    /** @type {string} Der URL-Pfad zur Homepage. Ohne Schrägstrich am Ende */
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
    DEBUG:false,
    /** @type {boolean} Ob ein Login für die Seite benötigt wird. */
    LOGIN:true,
    /** @type {string} */
    BREAK:"\n",
    /** @type {string} */
    INDENT:"   "
};

if(CONFIG.MINIFY){
    CONFIG.BREAK = "";
    CONFIG.INDENT = "";
}
if(CONFIG.IS_SERVER){
    CONFIG.PORT = 187;
    CONFIG.SITE_ROOT = "https://journalismus.ag";
}
/** @type {string} Die Grundstruktur der Seiten */
CONFIG.BASIC_TEMPLATE = fs
    .readFileSync("templates/basic.html","utf-8")
    .replace("<!--SITENAME-->", CONFIG.SITE_NAME);
