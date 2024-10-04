const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  arteChannelId: String,
  anunciosChannelId: String,
  keywords: [String]
});

module.exports = mongoose.model('Config', ConfigSchema);