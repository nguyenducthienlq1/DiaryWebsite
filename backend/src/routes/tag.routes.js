const express = require('express');
const authenticate = require('../middlewares/authenticate');
const entryController = require('../controllers/entry.controller');

const router = express.Router();

router.get('/', authenticate, entryController.tags);
router.post('/', authenticate, entryController.createTag);

module.exports = router;