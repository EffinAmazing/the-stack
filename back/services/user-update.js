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

module.exports = { sanitizeUserUpdate };
