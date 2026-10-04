const pool = require('../db/pool');

async function findByEmail(email) {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            password_hash AS "passwordHash",
            display_name AS "displayName"
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,
        [email]
    );
    return result.rows[0] || null;
}
async function findByGoogleSub(googleSub) {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            display_name AS "displayName"
        FROM users
        WHERE google_sub = $1
        `,
        [googleSub]
    );
    return result.rows[0] || null;
}
async function createUser(email, passwordHash, displayName, googleSub = null) {
    const result = await pool.query(
        `
        INSERT INTO users (email, password_hash, display_name, google_sub)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            email,
            display_name AS "displayName"
        `,
        [email, passwordHash, displayName, googleSub]
    );
    return result.rows[0];
}
module.exports = {
    findByEmail,
    findByGoogleSub,
    createUser,
};