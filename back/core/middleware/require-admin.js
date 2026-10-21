// Use after passport.authenticate('jwt'): req.user is reloaded from the DB on every request,
// so a role change takes effect immediately.
module.exports = function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ result: 'Error', message: 'You need to be registered' });
    }
    if (req.user.role !== 0) {
        return res.status(403).json({ result: 'Error', message: 'Forbidden' });
    }
    next();
};
