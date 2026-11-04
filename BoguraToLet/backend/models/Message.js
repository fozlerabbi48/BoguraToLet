// Re-export from Chat.js to avoid Mongoose duplicate model overwrite error
const { Message } = require('./Chat');
module.exports = Message;
