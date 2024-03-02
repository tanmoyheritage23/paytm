const {JWT_SECRET }= require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "You are not authorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await jwt.verify(token, JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid credentials!",
    });
  }
};

module.exports = { authMiddleware } ;
