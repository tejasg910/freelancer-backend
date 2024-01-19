const jwt = require("jsonwebtoken");
// Replace with your secret key
const { User } = require("../models"); // Replace with your User model
const authMiddleware = async (req, res, next) => {
  const { authToken } = req.cookies;
  console.log("came in middleware", req.cookies);
  if (!authToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const { email } = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.find({ email });

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = { authMiddleware };
