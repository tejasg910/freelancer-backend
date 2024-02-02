const jwt = require("jsonwebtoken");

// Function to generate a reset token
async function generateResetToken(email) {
  const token = await jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Set the expiration time (e.g., 1 hour)
  });
  return token;
}
async function generateLoginToken(id) {
  const token = await jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Set the expiration time (e.g., 1 hour)
  });
  return token;
}

// Function to verify and decode a reset token
function verifyResetToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.email;
  } catch (error) {
    // Token verification failed
    return null;
  }
}

// // Example usage:

// // Generate a reset token for a user with userId = 123
// const resetToken = generateResetToken(123);

// // Verify the reset token
// const userIdFromToken = verifyResetToken(resetToken);

// if (userIdFromToken) {
//   console.log(`Valid token for user with ID ${userIdFromToken}`);
// } else {
//   console.log("Invalid token or token expired");
// }

module.exports = { generateResetToken, verifyResetToken, generateLoginToken };
