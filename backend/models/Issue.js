const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    description: { type: String },
    assignedTo: { type: String },
    solution: {
      type: String,
      enum: ["Fix available", "Workaround", "No solution"],
    },
    changeLog: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
