function showPopup(message) {
    if (document.getElementById("api-popup")) {
      return;
    }
  
    // Create the overlay
    const overlay = document.createElement("div");
    overlay.id = "api-popup-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;
  
    // Create the popup container
    const popup = document.createElement("div");
    popup.id = "api-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      color: black;
      font-family: Arial, sans-serif;
    `;
  
    // Add the custom message
    const contentText = document.createElement("p");
    contentText.textContent = message;
    contentText.style.cssText = `
      margin-bottom: 20px;
      font-size: 16px;
    `;
    popup.appendChild(contentText);
  
    // Add a "Wait 10 Minutes" button
    const waitButton = document.createElement("button");
    waitButton.textContent = "Wait 10 Minutes";
    waitButton.style.cssText = `
      margin-right: 10px;
      padding: 10px 20px;
      background: #ff9800;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    waitButton.addEventListener("click", () => {
      const pauseEndTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      chrome.storage.sync.set({ pauseEndTime }, () => {
        // Dismiss the dialog
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
      });
    });
    popup.appendChild(waitButton);
  
    // Add a button to open WaniKani
    const goToWaniKaniButton = document.createElement("button");
    goToWaniKaniButton.textContent = "Go to WaniKani";
    goToWaniKaniButton.style.cssText = `
      margin-left: 10px;
      padding: 10px 20px;
      background: #0078d7;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    goToWaniKaniButton.addEventListener("click", () => {
      window.open("https://www.wanikani.com", "_blank"); // Open WaniKani in a new tab
    }); // Note: The overlay and popup are NOT removed here
    popup.appendChild(goToWaniKaniButton);
  
    // Append the overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "showPopup" && message.message) {
      showPopup(message.message);
    }
  });
  