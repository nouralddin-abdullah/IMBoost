const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    cid: {type: String, required: false},
    password: { type: String, required: true },
    xImvuSauce: { type: String },
    osCsid: { type: String },
    hasImage: { type: Boolean, default: false },
    followedAccounts: [
      {
        type: String,
      },
    ],
    postsLiked: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
