const express = require("express");
const rootRouter = require("./routes/index");
const cors = require("cors");

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(cors());

app.use("/api/v1", rootRouter);

app.listen(3000);
