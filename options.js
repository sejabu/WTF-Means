// Save options to Chrome storage
function saveOptions() {
  const apiService = document.getElementById('apiService').value;
  const apiKey = document.getElementById('apiKey').value;
  
  if (!apiKey) {
    showStatus('Please enter an API key.', 'error');
    return;
  }
  
  chrome.storage.sync.set(
    {
      apiService: apiService,
      apiKey: apiKey,
      isConfigured: true
    },
    function() {
      showStatus('Settings saved successfully!', 'success');
    }
  );
}

// Restore saved options when opening the options page
function restoreOptions() {
  chrome.storage.sync.get(
    {
      apiService: 'openai',
      apiKey: '',
      isConfigured: false
    },
    function(items) {
      document.getElementById('apiService').value = items.apiService;
      document.getElementById('apiKey').value = items.apiKey;
    }
  );
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';
  
  setTimeout(function() {
    status.style.display = 'none';
  }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);
