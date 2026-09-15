const User = require('../models/User');

const subscribeUser = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ success: false, message: 'Subscription object is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.pushSubscription = subscription;
    await user.save();

    res.status(200).json({ success: true, message: 'Subscribed to push notifications successfully' });
  } catch (error) {
    console.error('Push Subscription Error:', error);
    next(error);
  }
};

module.exports = { subscribeUser };
