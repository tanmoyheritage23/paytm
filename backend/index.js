const express = require("express");
const apiRouter = require("./routes/index");
const cors = require("cors");
const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/v1", apiRouter);

app.listen(PORT, () => {
  console.log(`app is running on ${PORT}`);
});
