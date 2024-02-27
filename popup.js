// HIGHLIGHTING DARK PATTERN
function scrapfrompage() {
    try {
        const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV'];
        const allElements = document.querySelectorAll(validTags.join(','));
  
        const scrapedData = new Set();
  
        for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            if (
                element.textContent.trim() !== '' &&
                !element.matches('script, style, html') &&
                !element.closest('[onclick], [onmouseover], [onmouseout], [onkeydown], [onkeyup], [onfocus], [onblur], [mouseleave], [mousemove], [clientX], [clientY], [offsetX], [onresize], [onfocus], [onchange], [onmouseout], [onkeydown], [ondragstart], [ondblclick]')
            ) {
                const textContent = element.textContent.trim();
                if (textContent.length <= 70) {
                    scrapedData.add(textContent);
                }
            }
        }
  
        console.log(scrapedData);
  
        scrapedData.forEach(data => {
            fetch('http://localhost:3000/classify?text=' + encodeURIComponent(data))
                .then(response => response.json())
                .then(result => {
                    console.log(`Text: ${result.text}`);
                    console.log(`Predicted Label: ${result.label}`);
  
                    if (result.label === "1" && result.text.split(' ').length > 3) {
                        const tagsToHighlight = ['span', 'div'];
                        tagsToHighlight.forEach(tag => {
                            document.querySelectorAll(tag).forEach(element => {
                                const regex = new RegExp(`\\b(${result.text})\\b`, "gi");
                                element.innerHTML = element.innerHTML.replace(regex, (match) =>
                              `<span style="border: 3px solid red; padding: 2px; background-color: yellow; font-weight: bold; color:black;">${match}</span>`);
                            });
                        });
                    }
  
                })
                .catch(err => {
                    console.error(`Error: ${err}`);
                });
        });
    } catch (err) {
        console.error(`Error: ${err}`);
    }
  }
  
  const scrap = document.getElementById('run');
  scrap.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapfrompage,
    });
  });
  
  function tracker() {
      const trackElement = document.getElementById('price');
  
      if (trackElement) {
          const track = trackElement.value; // Use .value instead of .innerHTML for input elements
  
          // Make a POST request to your server
          fetch('http://localhost:3000/track', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ trackData: track }),
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              console.log('Server response:', data);
  
              // Check if the request was successful
              if (data.status === 'success') {
                  // Extract the first element of the seleniumResult array
                  const firstElement = data.seleniumResult[0]+data.seleniumResult[1]+data.seleniumResult[2];
  
                  // Display the result in the HTML element with id "result"
                  const resultElement = document.getElementById('result');
                  resultElement.textContent = firstElement;
              } else {
                  console.error('Error:', data.message);
              }
          })
          .catch(error => {
              console.error('Fetch error:', error);
          });
      } else {
          console.error('Element with id "price" not found');
      }
  }
  
  const con = document.getElementById('track');
  con.addEventListener('click', tracker);
  
  
  
  // AD BLOCKER 
  
  let adblockStatus = {}; // Object to keep track of adblock status for each URL
  
  document.addEventListener('DOMContentLoaded', () => {
   const adblock = document.getElementById('blk');
   adblock.addEventListener("click", async () => {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      toggleAdblock(tab.id, tab.url);
   });
  });
  
  async function toggleAdblock(tabId, tabUrl) {
   if (adblockStatus[tabUrl] === undefined) {
      adblockStatus[tabUrl] = true; // Adblock is initially turned on
   }
  
   const shouldBlock = !adblockStatus[tabUrl]; // Invert the current status
   adblockStatus[tabUrl] = shouldBlock; // Update the status
  
   const url = new URL(tabUrl);
   const domain = url.hostname;
  
   chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: setBlockStatus,
      args: [domain, shouldBlock],
   });
  }
  
  function setBlockStatus(domain, shouldBlock) {
   if (shouldBlock) {
    addblck(domain);
   }
  }
  
  document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('uploadButton').addEventListener('click', function () {
          const fileInput = document.getElementById('imageInput');
          const file = fileInput.files[0];
          
          if (file) {
              const reader = new FileReader();
  
              reader.onload = function(event) {
                  const img = document.createElement('img');
                  img.src = event.target.result;
                  img.style.maxWidth = '200px'; // Limit image width for preview
                  const previewDiv = document.getElementById('preview');
                  previewDiv.innerHTML = '';
                  previewDiv.appendChild(img);
              };
  
              reader.readAsDataURL(file);
          } else {
              alert('Please select an image file.');
          }
      });
  });
  
  
  
  function addblck(domain) {
    console.log(`Blocking domain: ${domain}`);
  const blockedDomains = [
    'googlesyndication.com',
    'pagead2.googlesyndication.com',
    'googleads.g.doubleclick.net',
    'linkbucks.com',
    'adf.ly',
    'doubleclick.com',
    'doubleclicksolutions.com',
    'doubleclick.net',
    'googleadservices.com',
    'ads.github.com',
    ];
    console.log("Blocking started");
    const url = new URL(domain);
    const domainname = url.hostname;
    if (blockedDomains.includes(domainname)) {
      return { cancel: true }
    }
  }
