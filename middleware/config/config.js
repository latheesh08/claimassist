// Login Credentials
var credentials = require("./credentials");

module.exports.username = credentials.username; // enter your username here
module.exports.password = credentials.password; // enter your password here
// module.exports.username = ""; // enter your username here
// module.exports.password = ""; // enter your password here
// Authentication endpoints
module.exports.loginUrl =
  "https://uaa-server.dnn.galaxy.ai/uaa-security/login.do";
module.exports.refererUrl =
  "https://uaa-server.dnn.galaxy.ai/uaa-security/login";
// Galacticar API Endpoint
module.exports.clientUrl = "https://galaxy-us-rnd-web.dnn.galaxy.ai"; // US RND
// module.exports.clientUrl = "https://rcagypqqx8s8azyd-galacticar-web.dnn.galaxy.ai"; // JAMES
// module.exports.clientUrl = "https://t4xjakdzqi1tnbpn-galacticar-web.dnn.galaxy.ai"; // BAYO
// module.exports.clientUrl = "https://859m5i123y8s48zf-galacticar-web.dnn.galaxy.ai"; // KARTHIK
