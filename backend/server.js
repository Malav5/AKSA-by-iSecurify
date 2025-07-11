const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const wazuhRoutes = require('./routes/wazuh');
const memberRoutes = require("./routes/members");
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/domains", require("./routes/domains"));
app.use('/api/wazuh', wazuhRoutes);
app.use("/api/member", memberRoutes);
app.use('/api', taskRoutes);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
