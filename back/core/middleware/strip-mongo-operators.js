// Removes keys starting with "$" from req.query and req.body so request values can't turn
// into MongoDB operators (e.g. ?code[$ne]=x or {"code": {"$ne": null}}).
// Only plain objects and arrays are walked: express-form-data puts uploaded file streams
// into req.body, and those must be left untouched.
function isPlainObject(value) {
    if (value === null || typeof value !== 'object') return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function strip(value) {
    if (Array.isArray(value)) {
        value.forEach(strip);
    } else if (isPlainObject(value)) {
        Object.keys(value).forEach(function (key) {
            if (key.charAt(0) === '$') {
                delete value[key];
            } else {
                strip(value[key]);
            }
        });
    }
}

module.exports = function stripMongoOperators(req, res, next) {
    strip(req.query);
    strip(req.body);
    next();
};
