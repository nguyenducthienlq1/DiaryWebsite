const entryRepository = require('../repositories/entry.repository');
const pool = require('../db/pool');
const {
    encrypt,
    decrypt,
} = require('../utils/crypto');

async function create(userId, { title, content, entryDate, tags }) {
    const normalized = validateInput({ title, content, entryDate, tags });
    const tagIds = normalized.tags;

    const encryptedContent = encrypt(normalized.content);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const entry = await entryRepository.createEntry(client, {
            userId,
            title: normalized.title,
            encryptedContent,
            entryDate: normalized.entryDate,
        });

        const tags = await getExistingTags(client, userId, tagIds);
        await entryRepository.attachTags(client, entry.id, userId, tagIds);

        await client.query('COMMIT');
        return {
            id: entry.id,
            title: entry.title,
            content: normalized.content,
            entryDate: entry.entryDate,
            tags: tags.map((tag) => tag.name),
            createdAt: entry.createdAt,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function getById(userId, entryId) {
    const entry = await entryRepository.findEntryById(pool, userId, entryId);
    if (!entry) throw notFoundError();
    return formatDetail(entry);
}

async function list(userId, filters) {
    const result = await entryRepository.listEntries(pool, userId, filters);
    return {
        rows: result.rows,
        total: result.total,
    };
}

async function update(userId, entryId, input) {
    const normalized = validateInput(input);
    const client = await pool.connect();
    let committed = false;
    try {
        await client.query('BEGIN');
        const entry = await entryRepository.updateEntry(client, userId, entryId, {
            title: normalized.title,
            encryptedContent: encrypt(normalized.content),
            entryDate: normalized.entryDate,
        });
        if (!entry) throw notFoundError();

        await entryRepository.clearTags(client, entryId);
        const tags = await getExistingTags(client, userId, normalized.tags);
        await entryRepository.attachTags(client, entryId, userId, normalized.tags);

        const updatedEntry = await entryRepository.findEntryById(client, userId, entryId);
        if (!updatedEntry) throw notFoundError();
        const result = formatDetail(updatedEntry);

        await client.query('COMMIT');
        committed = true;
        return result;
    } catch (error) {
        if (!committed) await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function remove(userId, entryId) {
    const result = await entryRepository.deleteEntry(pool, userId, entryId);
    if (!result) throw notFoundError();
}

async function listTags(userId) {
    return entryRepository.listTags(pool, userId);
}

async function createTag(userId, input) {
    const name = typeof input?.name === 'string' ? input.name.trim() : '';
    if (!name || name.length > 50) {
        throw validationError('Tên tag là bắt buộc và không được vượt quá 50 ký tự');
    }

    try {
        return await entryRepository.createTag(pool, userId, name);
    } catch (error) {
        if (error.code === '23505') {
            const conflict = new Error('Tag đã tồn tại');
            conflict.status = 409;
            conflict.code = 'CONFLICT';
            conflict.expose = true;
            throw conflict;
        }
        throw error;
    }
}

async function getExistingTags(client, userId, tagIds) {
    const tags = await entryRepository.findTagsByIds(client, userId, tagIds);
    if (tags.length !== tagIds.length) {
        throw validationError('Một hoặc nhiều tag không tồn tại');
    }
    return tags;
}

function validateInput({ title, content, entryDate, tags = [] }) {
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 255 ||
        typeof content !== 'string' || !content.trim() ||
        !isValidDate(entryDate) || !Array.isArray(tags)) {
        throw validationError('Tiêu đề, nội dung, ngày bài viết và danh sách tag hợp lệ là bắt buộc');
    }
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const normalizedTags = [...new Set(tags)];
    if (normalizedTags.some((tag) => typeof tag !== 'string' || !uuidPattern.test(tag))) {
        throw validationError('Danh sách tag phải chứa ID tag hợp lệ');
    }
    return { title: title.trim(), content, entryDate, tags: normalizedTags };
}

function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function formatDetail(entry) {
    return {
        id: entry.id,
        title: entry.title,
        content: decrypt({ ciphertext: entry.contentCiphertext, iv: entry.iv, authTag: entry.authTag }),
        entryDate: entry.entryDate,
        tags: entry.tags,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    };
}

function notFoundError() {
    const error = new Error('Bài viết không tồn tại');
    error.status = 404;
    error.code = 'NOT_FOUND';
    error.expose = true;
    return error;
}

function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.expose = true;
    return error;
}

module.exports = { create, getById, list, update, remove, listTags, createTag };