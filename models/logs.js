const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Log = mongoose.model("Log", LogSchema);
module.exports = Log;
