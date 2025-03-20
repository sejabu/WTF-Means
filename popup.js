// Check if the extension is configured
function checkConfiguration() {
  chrome.storage.sync.get(
    {
      isConfigured: false,
      apiService: ''
    },
    function(items) {
      const configStatus = document.getElementById('configStatus');
      
      if (items.isConfigured) {
        configStatus.textContent = `Configured and ready to use with ${items.apiService}.`;
        configStatus.className = 'status configured';
      } else {
        configStatus.textContent = 'API key not configured. Please set up your API key in settings.';
        configStatus.className = 'status not-configured';
      }
    }
  );
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Add event listeners
document.addEventListener('DOMContentLoaded', checkConfiguration);
document.getElementById('openOptions').addEventListener('click', openOptions);
