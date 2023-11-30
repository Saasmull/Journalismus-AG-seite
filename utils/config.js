const os = require("os");
const fs = require("fs");

const CONFIG = module.exports = {
    /** @type {boolean} Ob der Code auf dem Server läuft. */
    IS_SERVER:(os.hostname()==="sponsor01"),
    /** @type {number} Der Port auf dem der Node.js-Server läuft. */
    PORT:8080,
    /** @type {string} Der Website-Name */
    SITE_NAME:"Journalismus-AG",
    /**@type {string} Die Beschreibung der Website. Sie wird in den `<meta>`-Tags und im JSON-LD fürs SEO genutzt.*/
    DESCRIPTION:"Wir sind die Journalismus-AG der Heinrich-Büssing-Schule aus Braunschweig. Entdecke spannende Beiträge über Technik, Politik, Sport, Umwelt und unsere Schule von der Journalismus AG!",
    /** @type {string} Das Logo der Website */
    LOGO:"/assets/images/icon.png",
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
    /** 
     * @typedef {Object} LoginConfig
     * @property {boolean} ON Ob ein Login für die Seite benötigt wird.
     * @property {boolean} OFF_ON_LOCALHOST Ob das Login auf localhost deaktiviert wird.
     * @property {string} USERNAME Der Nutzername des Logins.
     * @property {string} PASSWORD Das Passwort des Logins.
     */
    /** @type {LoginConfig} Die Login-Konfiguration. */
    LOGIN:{
        ON:false,
        OFF_ON_LOCALHOST:true,
        USERNAME:"user_journalismusag",
        PASSWORD:"vD6)1w3Bt*w<"
    },
    /** @type {boolean} Ob das Admin-Backend an ist. */
    ADMIN_BACKEND:false,
    /** @type {string} */
    BREAK:"\n",
    /** @type {string} */
    INDENT:"   ",
    /** @type {string} Die Version dieses Codes. */
    VERSION:"1.2.0",
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

/** @type {string} Die Grundstruktur der Aminseite */
CONFIG.ADMIN_TEMPLATE = fs.readFileSync("templates/admin.html","utf-8") || CONFIG.BASIC_TEMPLATE
    .replace("<!--CONTENT-->",fs.readFileSync("templates/generator.html","utf-8"));

CONFIG.LOGIN.ON = CONFIG.LOGIN.ON && (!CONFIG.LOGIN.OFF_ON_LOCALHOST || (CONFIG.LOGIN.OFF_ON_LOCALHOST && CONFIG.IS_SERVER));

//TEMP
//CONFIG.ADMIN_BACKEND = !CONFIG.IS_SERVER;
