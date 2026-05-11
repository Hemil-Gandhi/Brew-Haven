const Floor = require('../models/Floor');
const Table = require('../models/Table');

// Floor Controllers
exports.getFloors = async (req, res) => {
  try {
    const floors = await Floor.find();
    res.json(floors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFloor = async (req, res) => {
  try {
    const floor = new Floor(req.body);
    await floor.save();
    res.status(201).json(floor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!floor) return res.status(404).json({ message: 'Floor not found' });
    res.json(floor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    await Floor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Floor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Table Controllers
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('floorId');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const table = new Table(req.body);
    await table.save();
    const populated = await Table.findById(table._id).populate('floorId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('floorId');
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
