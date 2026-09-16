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
        WHERE email = $1
        `,
        [email]
    );
    return result.rows[0] || null;
}
async function createUser(email, passwordHash, displayName) {
    const result = await pool.query(
        `
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            email,
            display_name AS "displayName"
        `,
        [email, passwordHash, displayName]
    );
    return result.rows[0];
}
module.exports = {
    findByEmail,
    createUser,
};