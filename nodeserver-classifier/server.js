const natural = require('natural');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const express = require('express');
const cors = require('cors');
const {Builder, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const app = express();
app.use(cors());
app.use(express.json());
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

// app.post('/track', (req, res) => {
//   const productUrl = req.body.trackData;
//   // Process the trackData as needed
//   console.log('Received track data:', trackData);

//   // Send a response back to the client
//   res.json({ status: 'success', message: 'Track data received successfully' });
// });

app.post('/track', async (req, res) => {
  try {
    const trackData = req.body.trackData;
    console.log('Received track data:', trackData);

    // Your Selenium code here
    const seleniumResult = await runSeleniumCode(trackData);

    // Send the Selenium result back to the client
    res.json({ status: 'success', message: 'Track data received successfully', seleniumResult });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

async function runSeleniumCode(productLink) {
  let driver;

  try {
    let options = new firefox.Options();
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();

    await driver.get('https://pricehistory.app/');

    const searchInput = await driver.findElement(By.id('search'));
    await searchInput.sendKeys(productLink, Key.RETURN);

    const allTimePriceOverview = await driver.wait(until.elementLocated(By.className('all-time-price-overview')), 55000);
    const text = await allTimePriceOverview.getText();

    const resultArray = text.split('\n');
    console.log(resultArray);
    return resultArray;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}


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
