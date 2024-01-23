// webscrap + highlight
function scrapfrompage() {
  try {
    const validTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "DIV"]; // Add more tags if needed
    const allElements = document.querySelectorAll(validTags.join(","));

    const scrapedData = new Set(); // Use a Set to store unique values

    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (
        element.textContent.trim() !== "" &&
        !element.matches("script, style, html") &&
        !element.closest(
          "[onclick], [onmouseover], [onmouseout], [onkeydown], [onkeyup], [onfocus], [onblur], [mouseleave], [mousemove], [clientX], [clientY], [offsetX], [onresize], [onfocus], [onchange], [onmouseout], [onkeydown], [ondragstart], [ondblclick]"
        )
      ) {
        const textContent = element.textContent.trim();
        if (textContent.length <= 70) {
          // Limit the data to a maximum length of 70 characters
          scrapedData.add(textContent);
        }
      }
    }

    console.log(scrapedData);

    scrapedData.forEach((data) => {
      fetch("http://localhost:3000/classify?text=" + encodeURIComponent(data))
        .then((response) => response.json())
        .then((result) => {
          console.log(`Text: ${result.text}`);
          console.log(`Predicted Label: ${result.label}`);

          // if (result.label === "1") { // Highlight words if predicted label is 1
          //     const tagsToHighlight = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6','span','div'];
          //     for (let j = 0; j < tagsToHighlight.length; j++) {
          //       const elementsToHighlight = document.getElementsByTagName(tagsToHighlight[j]);
          //       for (let i = 0; i < elementsToHighlight.length; i++) {
          //         const element = elementsToHighlight[i];
          //         const regex = new RegExp("\\b(" + result.text + ")\\b", "gi");
          //         element.innerHTML = element.innerHTML.replace(regex, '<span style="background-color: yellow; font-weight: bold;">$1</span>');
          //       }
          //     }
          //   }
        })
        .catch((err) => {
          console.error(`Error: ${err}`);
        });
    });
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const scrap = document.getElementById("run");
  scrap.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapfrompage,
    });
  });
});

// screenshot + text recognition
document.addEventListener("DOMContentLoaded", () => {
  const screenshotBtn = document.getElementById("screenshotBtn");
  const resultDiv = document.getElementById("result");

  screenshotBtn.addEventListener("click", () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);

        // Convert the canvas image to a Blob object
        canvas.toBlob((blob) => {
          // Create a FormData object and append the image file to it
          const formData = new FormData();
          formData.append("image", blob, "screenshot.png");

          // Make an API request to your local Node.js server for text recognition
          fetch("http://localhost:3000/api/recognize", {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to recognize text from content.js");
              }
              return response.json();
            })
            .then((data) => {
              const { text } = data;

              // Print the recognized text in the console and display it on the popup
              console.log("Recognized Text:", text);
              resultDiv.textContent = "Recognized Text: " + text;
            })
            .catch((error) => {
              console.error(error);
              resultDiv.textContent = error.message;
            });
        }, "image/png");
      };
      img.src = dataUrl;
    });
  });
});
