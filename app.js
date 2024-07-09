const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

const runAutomation = require("./automationRunner");

app.get("/", (req, res) => {
  const htmlContent = fs.readFileSync(
    path.join(__dirname, "views", "index.html"),
    "utf8"
  );

  res.send(htmlContent);
});

app.get("/run-automation", (req, res) => {
  runAutomation()
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred during automation." });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
