const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

UserSchema.virtual("Log", {
  ref: "Log",
  foreignField: "user",
  localField: "_id",
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
