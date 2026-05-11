const Session = require('../models/Session');

exports.openSession = async (req, res) => {
  try {
    const { terminalId, staffId, openingBalance } = req.body;
    const session = new Session({ terminalId, staffId, openingBalance });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { closingBalance } = req.body;
    const session = await Session.findByIdAndUpdate(id, { 
      closingBalance, 
      closedAt: Date.now(), 
      status: 'Closed' 
    }, { new: true });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ status: 'Open' }).populate('staffId');
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('staffId').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
