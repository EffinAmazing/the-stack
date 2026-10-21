// Fields an admin may change from the Users page (update-user-form). Everything else
// (password, validationCode, created, ...) is dropped.
const EDITABLE_FIELDS = ['email', 'firstName', 'lastName', 'role', 'verified'];

function sanitizeUserUpdate(data, editorId, targetId) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { error: 'incorrect data' };
    }

    const clean = {};
    EDITABLE_FIELDS.forEach((key) => {
        if (data[key] !== undefined) clean[key] = data[key];
    });

    if (clean.role !== undefined && clean.role !== 0 && clean.role !== 1) {
        return { error: 'Invalid role' };
    }
    if (clean.verified !== undefined && typeof clean.verified !== 'boolean') {
        return { error: 'Invalid verified flag' };
    }
    if (clean.role === 1 && String(editorId) === String(targetId)) {
        return { error: 'You cannot remove your own administrator role' };
    }

    return { data: clean };
}

// Fields a user may set on themselves when signing up or completing an invite (signup-form,
// signup-signin-popup). Everything else (role, verified, validationCode, repeatPassword, ...)
// is dropped; role and verified come from the schema defaults or the server.
const SIGNUP_FIELDS = ['email', 'firstName', 'lastName', 'password'];

function sanitizeSignupData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { error: 'Bad request' };
    }

    const clean = {};
    for (const key of SIGNUP_FIELDS) {
        if (data[key] === undefined) continue;
        if (typeof data[key] !== 'string') {
            return { error: 'Bad request' };
        }
        clean[key] = data[key];
    }

    return { data: clean };
}

module.exports = { sanitizeUserUpdate, sanitizeSignupData };
