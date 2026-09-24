const express = require('express');
const entryController = require('../controllers/entry.controller');

const router = express.Router();
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);
router.post('/', entryController.create);
router.get('/', entryController.list);
router.get('/:id', entryController.validateEntryId, entryController.getById);
router.put('/:id', entryController.validateEntryId, entryController.update);
router.delete('/:id', entryController.validateEntryId, entryController.remove);

module.exports = router;
