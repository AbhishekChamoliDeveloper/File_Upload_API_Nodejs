const express = require("express");
const apiRoute = require("./routes/apiRoute");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.use("/", apiRoute);

module.exports = app;
