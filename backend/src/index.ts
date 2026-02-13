import express = require("express");
import cors = require("cors");
import apiRouter = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
