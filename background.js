chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const wanikaniDomain = "wanikani.com";
      if (tab.url.includes(wanikaniDomain)) {
        console.log("On WaniKani domain. Skipping API checks.");
        return;
      }
  
      chrome.storage.sync.get(["pauseEndTime", "enableLessons", "enableReviews", "authKey"], (settings) => {
        const currentTime = Date.now();
        if (settings.pauseEndTime && currentTime < settings.pauseEndTime) {
          console.log("API checks paused. Skipping API requests.");
          return;
        }
  
        if (!settings.authKey) {
          console.error("Authorization Key not set. Skipping API requests.");
          return;
        }
  
        const fetchPromises = [];
  
        if (settings.enableReviews !== false) {
          const reviewsEndpoint = "https://api.wanikani.com/v2/assignments?immediately_available_for_review=true";
          fetchPromises.push(
            fetch(reviewsEndpoint, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${settings.authKey}`
              }
            }).then(response => response.json())
          );
        }
  
        if (settings.enableLessons !== false) {
          const lessonsEndpoint = "https://api.wanikani.com/v2/assignments?immediately_available_for_lessons=true&in_review=true";
          fetchPromises.push(
            fetch(lessonsEndpoint, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${settings.authKey}`
              }
            }).then(response => response.json())
          );
        }
  
        Promise.all(fetchPromises)
          .then((responses) => {
            const reviewsData = responses[0] || { total_count: 0 };
            const lessonsData = responses[1] || { total_count: 0 };
  
            const reviewsCount = reviewsData.total_count || 0;
            const lessonsCount = lessonsData.total_count || 0;
  
            if (reviewsCount !== 0 || lessonsCount !== 0) {
              const message = `You have ${lessonsCount} pending lessons and ${reviewsCount} pending reviews.`;
              chrome.tabs.sendMessage(tabId, { type: "showPopup", message });
            }
          })
          .catch(error => {
            console.error("Error fetching API data:", error);
          });
      });
    }
  });
  