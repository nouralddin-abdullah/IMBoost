const { autoJoinRoom } = require('../services/autoJoinRoom.service');
const { incrementDailyUsage } = require('../middleware/planLimits');

async function joinRoomWithAccounts(req, res) {
  const { roomId, numberOfAccounts } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  if (!numberOfAccounts) {
    return res.status(400).json({ error: 'numberOfAccounts is required' });
  }

  try {
    const results = await autoJoinRoom(roomId, numberOfAccounts, req.user);
    
    // Increment daily usage counter
    if (req.dailyUsage) {
      await incrementDailyUsage(req.dailyUsage, 'join');
    }
    
    res.json({ 
      message: `Auto join room completed for room ${roomId}`, 
      results,
      totalRequested: numberOfAccounts,
      successful: results.filter(r => r.status === 'joined').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  joinRoomWithAccounts,
};
