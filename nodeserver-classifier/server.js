const { createWorker } = require("tesseract.js");
const natural = require("natural");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const express = require("express");
const cors = require("cors");
const Jimp = require("jimp");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

const classifier = new natural.BayesClassifier();
const currentDirectory = process.cwd();
const csvFileName = "modified_dataset.csv";
const csvFilePath = path.join(currentDirectory, csvFileName);
const csvFile = fs.readFileSync(csvFilePath, "utf8");
const parsedData = Papa.parse(csvFile, { header: true });

parsedData.data.forEach((data, i) => {
  if (data && data.TEXT && data.label) {
    classifier.addDocument(data.TEXT, data.label.toString());
  } else {
    console.error("Invalid data format:", data, "at index", i);
  }
});
classifier.train();

app.get("/classify", (req, res) => {
  const inputText = req.query.text;
  if (!inputText) {
    res.status(400).json({ error: "Missing text parameter" });
    return;
  }
  const predictedLabel = classifier.classify(inputText);
  res.json({ text: inputText, label: predictedLabel });
});

// Initialize the Tesseract.js worker
const worker = createWorker({
  // logger: (m) => console.log(m) // Uncomment this line to see the log messages
});

(async () => {
  try {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
  } catch (error) {
    console.error("Error initializing Tesseract worker:", error);
  }
})();

app.post("/api/recognize", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Missing image data" });
    return;
  }
  try {
    const image = await Jimp.read(file.path);
    const text = await worker.recognize(image.bitmap);
    const predictedLabel = classifier.classify(text.text);
    res.json({ text: text.text, label: predictedLabel });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
