let timerInterval = null;

// Save settings
document.getElementById("saveSettings").addEventListener("click", () => {
  const enableLessons = document.getElementById("toggleLessons").checked;
  const enableReviews = document.getElementById("toggleReviews").checked;
  const authKey = document.getElementById("authKey").value;

  // Save preferences and API key to Chrome storage
  chrome.storage.sync.set({ enableLessons, enableReviews, authKey }, () => {
    alert("Settings saved!");
  });
});

// Load saved settings and handle timer state
chrome.storage.sync.get(["enableLessons", "enableReviews", "authKey", "pauseEndTime"], (result) => {
  document.getElementById("toggleLessons").checked = result.enableLessons ?? true;
  document.getElementById("toggleReviews").checked = result.enableReviews ?? true;
  document.getElementById("authKey").value = result.authKey ?? "";

  const pauseEndTime = result.pauseEndTime ?? 0;
  if (Date.now() < pauseEndTime) {
    startTimer(pauseEndTime);
    document.getElementById("resumeButton").style.display = "inline-block";
  } else {
    document.getElementById("resumeButton").style.display = "none";
  }
});

// Handle "Wait 10 Minutes" button
document.getElementById("waitButton").addEventListener("click", () => {
  const pauseEndTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  chrome.storage.sync.set({ pauseEndTime }, () => {
    startTimer(pauseEndTime);
    document.getElementById("resumeButton").style.display = "inline-block";
  });
});

// Handle "Resume Now" button
document.getElementById("resumeButton").addEventListener("click", () => {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "API checks resumed.";
  chrome.storage.sync.remove("pauseEndTime");
  document.getElementById("resumeButton").style.display = "none";
});

// Start the timer
function startTimer(pauseEndTime) {
  const timerElement = document.getElementById("timer");

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remainingTime = pauseEndTime - Date.now();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      timerElement.textContent = "API checks resumed.";
      chrome.storage.sync.remove("pauseEndTime");
      document.getElementById("resumeButton").style.display = "none";
    } else {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      timerElement.textContent = `Time remaining: ${minutes}m ${seconds}s`;
    }
  }, 1000);
}
