const entryService = require('../services/entry.service');

async function create(req, res, next) {
    try {
        const { title, content, entryDate, tags = [] } = req.body || {};
        const result = await entryService.create(req.userId, { title, content, entryDate, tags });
        res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
}

function parseFilters(query) {
    const page = Number.parseInt(query.page || '1', 10);
    const limit = Number.parseInt(query.limit || '20', 10);
    const tagIds = Array.isArray(query.tags) ? query.tags : (query.tags || '').split(',').filter(Boolean);
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100 ||
        tagIds.some((tagId) => !uuidPattern.test(tagId)) ||
        (query.from && !isDate(query.from)) || (query.to && !isDate(query.to))) {
        const error = new Error('Tham số phân trang hoặc tag không hợp lệ');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }
    return { from: query.from, to: query.to, tagIds, search: query.search, page, limit };
}

function isDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function validateEntryId(req, res, next) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Bài viết không tồn tại' },
        });
    }
    next();
}

async function list(req, res, next) {
    try {
        const filters = parseFilters(req.query);
        const result = await entryService.list(req.userId, filters);
        res.json({
            success: true, data: result.rows, meta: {
                page: filters.page,
                limit: filters.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / filters.limit),
            }
        });
    } catch (error) { next(error); }
}

async function getById(req, res, next) {
    try {
        res.json({ success: true, data: await entryService.getById(req.userId, req.params.id) });
    } catch (error) { next(error); }
}

async function update(req, res, next) {
    try {
        res.json({ success: true, data: await entryService.update(req.userId, req.params.id, req.body || {}) });
    } catch (error) { next(error); }
}

async function remove(req, res, next) {
    try {
        await entryService.remove(req.userId, req.params.id);
        res.json({ success: true, data: null });
    } catch (error) { next(error); }
}

async function tags(req, res, next) {
    try {
        res.json({ success: true, data: await entryService.listTags(req.userId) });
    } catch (error) { next(error); }
}

async function createTag(req, res, next) {
    try {
        const tag = await entryService.createTag(req.userId, req.body || {});
        res.status(201).json({ success: true, data: tag });
    } catch (error) { next(error); }
}

module.exports = { create, list, getById, update, remove, tags, createTag, validateEntryId };