
console.log("This prints to the console of the service worker (background script)")

const allElements = document.getElementsByTagName('*');

for (let i = 0; i < allElements.length; i++) {
  const element = allElements[i];

  if (element.tagName === 'A') {
    continue;
  }

  const textContent = element.textContent.trim();

  console.log(textContent);
}



//highlighting the word

// // Define the word to highlight
// const wordToHighlight = "Accessories";

// // Create a regular expression to match the word globally
// const regex = new RegExp(wordToHighlight, "gi");

// // Function to inject the content script and highlight the word
// function highlightWord(tabId) {
//   chrome.tabs.executeScript(tabId, {
//     file: "content.js"
//   }, function() {
//     chrome.tabs.sendMessage(tabId, {
//       action: "highlight",
//       word: wordToHighlight,
//       regex: regex.source
//     });
//   });
// }

// // Listen for a click on the browser action button
// chrome.browserAction.onClicked.addListener(function(tab) {
//   // Call the highlightWord function when the button is clicked
//   highlightWord(tab.id);
// });




// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.action === "highlight") {
//     const word = message.word;
//     const regex = new RegExp(`\\b${word}\\b`, "gi");

//     chrome.tabs.executeScript(null, {
//       code: `
//         Array.from(document.getElementsByTagName("body")).forEach(function(element) {
//           element.innerHTML = element.innerHTML.replace(${regex}, '<span style="background-color: yellow;">$&</span>');
//         });
//       `
//     });
//   }
// });
