const natural = require('natural');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

const classifier = new natural.BayesClassifier();

// Get the current directory
const currentDirectory = process.cwd();

// Construct the relative path to your CSV file
const csvFileName = 'modified_dataset.csv';
const csvFilePath = path.join(currentDirectory, csvFileName);

// Read CSV file
const csvFile = fs.readFileSync(csvFilePath, 'utf8');

// Parse CSV data
const parsedData = Papa.parse(csvFile, { header: true });

// Training the classifier
let i=0
parsedData.data.forEach(data => {
  if (data && data.TEXT && data.label) {
    classifier.addDocument(data.TEXT, data.label.toString());
  } else {
    console.error('Invalid data format:', data,'',i);
  }
  i++;
});

classifier.train();

// API endpoint for classification
app.get('/classify', (req, res) => {
  const inputText = req.query.text;
  if (!inputText) {
    res.status(400).json({ error: 'Missing text parameter' });
    return;
  }

  const predictedLabel = classifier.classify(inputText);
  res.json({ text: inputText, label: predictedLabel });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
