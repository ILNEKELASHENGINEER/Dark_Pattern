
//web scrapping
console.log("This prints to the console (injected only if the page url matched)");

var scrap = document.getElementById('run');
scrap.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapfrompage,
    });
});

function scrapfrompage() {
    try{
    const allElements = document.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if(element.length==0 || element==null || element.length>25){
            continue;
        }
        else
        console.log(element.textContent.trim());
    }}
    catch(err){
        alert(`Error! ${err}`);
    }
}


