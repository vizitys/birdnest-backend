import express from "express";
import { pilots } from "./watch";

const app = express();
const port = 5000;

app.get("/", async (req, res) => {
  res.status(200).json(pilots);
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
