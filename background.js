// Create a context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create the context menu
  chrome.contextMenus.create({
    id: "explainInitials",
    title: "Explain initials",
    contexts: ["selection"]
  });
  
  // Check if the extension is already configured
  chrome.storage.sync.get('isConfigured', function(data) {
    if (!data.isConfigured) {
      // Open options page for first-time setup
      chrome.runtime.openOptionsPage();
    }
  });
});

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainInitials") {
    // Check if API key is configured
    chrome.storage.sync.get('isConfigured', function(data) {
      if (data.isConfigured) {
        // Send a message to the content script with the selected text
        chrome.tabs.sendMessage(tab.id, {
          action: "explainInitials",
          selection: info.selectionText
        });
      } else {
        // Notify the user to configure the API key
        chrome.tabs.sendMessage(tab.id, {
          action: "showConfigurationNeeded"
        });
      }
    });
  }
});
