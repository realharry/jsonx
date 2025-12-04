/**
 * Simple webpack loader that converts `.jsonx` source into a JS module.
 * Place this loader in your project and add a rule for `/\.jsonx$/`.
 * Example: in `next.config.js` add a rule that uses this loader.
 */
const { SimpleJsonParser } = require('@aimuse/jsonx-core');

module.exports = function (source) {
    const callback = this.async();
    try {
        const parser = new SimpleJsonParser();
        const obj = parser.parse ? parser.parse(source) : SimpleJsonParser(source);
        const code = `export default ${JSON.stringify(obj)};`;
        callback(null, code);
    } catch (err) {
        callback(err);
    }
};
