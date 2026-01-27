const jwt = require('jsonwebtoken');
const db = require('../models');

// Middleware για έλεγχο authentication
const protect = async (req, res, next) => {
  let token;

  // Έλεγχος αν υπάρχει token στο Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Παίρνουμε το token από το header
      token = req.headers.authorization.split(' ')[1];

      // Verify το token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Βρίσκουμε τον χρήστη (χωρίς το password)
      req.user = await db.User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'User account is deactivated' 
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

module.exports = { protect };