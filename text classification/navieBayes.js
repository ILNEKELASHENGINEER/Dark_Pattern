const natural = require('natural');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

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
parsedData.data.forEach(data => {
    if (data && data.text && data.label) {
        classifier.addDocument(data.text, data.label.toString());
    } else {
        console.error('Invalid data format:', data);
    }
});

classifier.train();

// Function to test the model with a sample input
function testModel(inputText) {
    const predictedLabel = classifier.classify(inputText);
    console.log(`Text: "${inputText}"`);
    console.log(`Predicted Label: ${predictedLabel}`);
}

// Example of using the classifier with a sample input
const sampleInput = "2 products left";
testModel(sampleInput);

const sampleInput2 = "Trending Players"
testModel(sampleInput2);
const sampleInput3 = "product out of stock"
testModel(sampleInput3);



//  https://cdn.jsdelivr.net/npm/natural@6.10.4/lib/natural/index.min.js
// https://cdn.jsdelivr.net/npm/papaparse@5.4.1/player/player.min.css
// https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js