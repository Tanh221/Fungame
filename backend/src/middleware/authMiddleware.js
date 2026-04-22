const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1];
    //split by space and take the second part

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.player = decoded;
    // Attach player info to the request
    // Now any route using this middleware knows WHO is making the request

    next();

  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired, please login again' });
  }
};

module.exports = { protect };