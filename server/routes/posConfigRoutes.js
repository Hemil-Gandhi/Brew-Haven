const express = require('express');
const router = express.Router();
const { getFloors, createFloor, updateFloor, deleteFloor, getTables, createTable, updateTable, deleteTable } = require('../controllers/posConfigController');

router.get('/floors', getFloors);
router.post('/floors', createFloor);
router.put('/floors/:id', updateFloor);
router.delete('/floors/:id', deleteFloor);
router.get('/tables', getTables);
router.post('/tables', createTable);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

module.exports = router;
