const jwt = require("jsonwebtoken");
// Replace with your secret key
const { User } = require("../models"); // Replace with your User model
const { excludeUserInfo } = require("../services/service.constants");
const authMiddleware = async (req, res, next) => {
  console.log(req.cookies);
  const { authToken } = req.cookies;
  console.log(authToken);
  if (!authToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const UsersId = jwt.verify(authToken, process.env.JWT_SECRET);


    // console.log(id, "id");
    const user = await User.findById(UsersId.id).select(excludeUserInfo);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = { authMiddleware };
