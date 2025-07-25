const mongoose = require("mongoose");
module.exports = mongoose.model(
  "plan",
  new mongoose.Schema({
    _id: String,
    isFree: Boolean,
    DomainLimit: Number,
    rescanWaitHours: Number,
    price: Number,
  })
);
