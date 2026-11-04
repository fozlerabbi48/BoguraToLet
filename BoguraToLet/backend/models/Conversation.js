// Re-export from Chat.js to avoid Mongoose duplicate model overwrite error
const { Conversation } = require('./Chat');
module.exports = Conversation;
