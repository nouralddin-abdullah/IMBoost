const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  xImvuSauce: { type: String }, 
  osCsid: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
