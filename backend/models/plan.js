const mongoose = require("mongoose");
module.exports = mongoose.model(
  "plan",
  new mongoose.Schema({
    _id: String,
    isFree: Boolean,
    scanLimit: Number,
    rescanWaitHours: Number,
    price: Number,
  })
);
