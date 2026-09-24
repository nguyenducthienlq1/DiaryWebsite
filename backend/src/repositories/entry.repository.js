async function createEntry(client, { userId, title, encryptedContent, entryDate }) {
    const result = await client.query(
        `
        INSERT INTO diary_entries
            (user_id, title, content_ciphertext, iv, auth_tag, entry_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            title,
            entry_date AS "entryDate",
            created_at AS "createdAt"
        `,
        [userId, title, encryptedContent.ciphertext, encryptedContent.iv, encryptedContent.authTag, entryDate]
    );
    return result.rows[0];
}

async function createTag(client, userId, name) {
    const result = await client.query(
        `
        INSERT INTO tags (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name
        `,
        [userId, name]
    );
    return result.rows[0];
}

async function findTagsByIds(client, userId, tagIds) {
    if (!tagIds.length) return [];
    const result = await client.query(
        `
        SELECT id, name
        FROM tags
        WHERE user_id = $1 AND id = ANY($2::uuid[])
        `,
        [userId, tagIds]
    );
    return result.rows;
}

async function attachTags(client, entryId, userId, tagIds) {
    if (!tagIds.length) return;
    await client.query(
        `
        INSERT INTO entry_tags (entry_id, tag_id)
        SELECT $1, tag.id
        FROM tags tag
        WHERE tag.user_id = $2 AND tag.id = ANY($3::uuid[])
        ON CONFLICT DO NOTHING
        `,
        [entryId, userId, tagIds]
    );
}

async function findEntryById(client, userId, entryId) {
    const result = await client.query(
        `
        SELECT
            e.id,
            e.title,
            e.content_ciphertext AS "contentCiphertext",
            e.iv,
            e.auth_tag AS "authTag",
            e.entry_date AS "entryDate",
            e.created_at AS "createdAt",
            e.updated_at AS "updatedAt",
            COALESCE(
                json_agg(t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags
        FROM diary_entries e
        LEFT JOIN entry_tags et ON et.entry_id = e.id
        LEFT JOIN tags t ON t.id = et.tag_id AND t.user_id = e.user_id
        WHERE e.id = $1 AND e.user_id = $2 AND e.deleted_at IS NULL
        GROUP BY e.id
        `,
        [entryId, userId]
    );
    return result.rows[0] || null;
}

async function listEntries(client, userId, { from, to, tagIds, search, page, limit }) {
    const values = [userId];
    const conditions = ['e.user_id = $1', 'e.deleted_at IS NULL'];

    if (from) {
        values.push(from);
        conditions.push(`e.entry_date >= $${values.length}`);
    }
    if (to) {
        values.push(to);
        conditions.push(`e.entry_date <= $${values.length}`);
    }
    if (tagIds.length) {
        values.push(tagIds);
        conditions.push(`EXISTS (
            SELECT 1 FROM entry_tags et_filter
            WHERE et_filter.entry_id = e.id AND et_filter.tag_id = ANY($${values.length}::uuid[])
        )`);
    }
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`e.title ILIKE $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');
    const countResult = await client.query(
        `SELECT COUNT(*)::int AS total FROM diary_entries e WHERE ${whereClause}`,
        values
    );

    values.push(limit, (page - 1) * limit);
    const result = await client.query(
        `
        SELECT
            e.id,
            e.title,
            e.entry_date AS "entryDate",
            COALESCE(
                json_agg(t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags
        FROM diary_entries e
        LEFT JOIN entry_tags et ON et.entry_id = e.id
        LEFT JOIN tags t ON t.id = et.tag_id AND t.user_id = e.user_id
        WHERE ${whereClause}
        GROUP BY e.id
        ORDER BY e.entry_date DESC, e.created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}
        `,
        values
    );

    return { rows: result.rows, total: countResult.rows[0].total };
}

async function updateEntry(client, userId, entryId, { title, encryptedContent, entryDate }) {
    const result = await client.query(
        `
        UPDATE diary_entries
        SET title = $1,
            content_ciphertext = $2,
            iv = $3,
            auth_tag = $4,
            entry_date = $5
        WHERE id = $6 AND user_id = $7 AND deleted_at IS NULL
        RETURNING id, title, entry_date AS "entryDate",
                  created_at AS "createdAt", updated_at AS "updatedAt"
        `,
        [title, encryptedContent.ciphertext, encryptedContent.iv, encryptedContent.authTag, entryDate, entryId, userId]
    );
    return result.rows[0] || null;
}

async function clearTags(client, entryId) {
    await client.query('DELETE FROM entry_tags WHERE entry_id = $1', [entryId]);
}

async function deleteEntry(client, userId, entryId) {
    const result = await client.query(
        `
        UPDATE diary_entries
        SET deleted_at = now()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        RETURNING id
        `,
        [entryId, userId]
    );
    return result.rows[0] || null;
}

async function listTags(client, userId) {
    const result = await client.query(
        `SELECT id, name FROM tags WHERE user_id = $1 ORDER BY name ASC`,
        [userId]
    );
    return result.rows;
}

module.exports = {
    createEntry,
    createTag,
    findTagsByIds,
    attachTags,
    findEntryById,
    listEntries,
    updateEntry,
    clearTags,
    deleteEntry,
    listTags,
};