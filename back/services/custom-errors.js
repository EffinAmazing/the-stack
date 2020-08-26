
class UserModelError extends Error {
    constructor(message, options) {
        super(message);
        this.userData = options.data;
        this.type = options.type;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    UserModelError
}