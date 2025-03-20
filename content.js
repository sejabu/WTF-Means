// Global variable to store the modal element
let modal = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "explainInitials") {
    const selectedText = request.selection;
    const context = getPageContext(selectedText);
    
    // Create and show the modal
    showModal(selectedText, context);
    
    // Get API configuration and call the AI service
    chrome.storage.sync.get(
      {
        apiService: 'openai',
        apiKey: ''
      },
      function(config) {
        getExplanation(selectedText, context, config)
          .then(explanation => {
            updateModalContent(explanation);
          })
          .catch(error => {
            updateModalContent(`Error: ${error.message}`);
          });
      }
    );
  } else if (request.action === "showConfigurationNeeded") {
    showConfigurationNeededModal();
  }
});

// Function to show a modal prompting the user to configure API key
function showConfigurationNeededModal() {
  // Create the modal
  modal = document.createElement('div');
  modal.className = 'initials-explainer-modal';
  modal.innerHTML = `
    <div class="initials-explainer-modal-content">
      <div class="initials-explainer-modal-header">
        <span class="initials-explainer-modal-title">API Key Required</span>
        <span class="initials-explainer-modal-close">&times;</span>
      </div>
      <div class="initials-explainer-modal-body">
        <p>You need to configure your API key before using this extension.</p>
        <button id="configure-api-button" class="initials-explainer-button">Configure Now</button>
      </div>
    </div>
  `;
  
  // Add styles
  addModalStyles();
  
  document.body.appendChild(modal);
  
  // Add event listeners
  const closeButton = modal.querySelector('.initials-explainer-modal-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    modal = null;
  });
  
  const configureButton = document.getElementById('configure-api-button');
  configureButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    document.body.removeChild(modal);
    modal = null;
  });
  
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      document.body.removeChild(modal);
      modal = null;
    }
  });
}

// Function to get context from the page
function getPageContext(selectedText) {
  // Get the surrounding paragraph or container of the selected text
  const selection = window.getSelection();
  if (!selection.rangeCount) return "";
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer.parentElement;
  
  // Get text from the container and surrounding elements
  let context = container.innerText || container.textContent;
  
  // Get the document title as additional context
  const title = document.title;
  
  // Get meta description if available
  const metaDescription = document.querySelector('meta[name="description"]')?.content || "";
  
  // Combine all context information
  const fullContext = `Title: ${title}\nDescription: ${metaDescription}\nContext: ${context}`;
  
  return fullContext;
}

// Function to show the modal
function showModal(initials, context) {
  // Remove any existing modal
  if (modal) {
    document.body.removeChild(modal);
  }
  
  // Create the modal container
  modal = document.createElement('div');
  modal.className = 'initials-explainer-modal';
  modal.innerHTML = `
    <div class="initials-explainer-modal-content">
      <div class="initials-explainer-modal-header">
        <span class="initials-explainer-modal-title">Explaining: ${initials}</span>
        <span class="initials-explainer-modal-close">&times;</span>
      </div>
      <div class="initials-explainer-modal-body">
        <p>Analyzing context...</p>
        <div class="initials-explainer-loader"></div>
      </div>
      <div class="initials-explainer-modal-footer">
        <p>Powered by Initials Explainer</p>
      </div>
    </div>
  `;
  
  // Add styles
  addModalStyles();
  
  document.body.appendChild(modal);
  
  // Add close button functionality
  const closeButton = modal.querySelector('.initials-explainer-modal-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    modal = null;
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      document.body.removeChild(modal);
      modal = null;
    }
  });
}

// Function to add modal styles
function addModalStyles() {
  // Check if styles are already added
  if (document.getElementById('initials-explainer-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'initials-explainer-styles';
  style.textContent = `
    .initials-explainer-modal {
      position: fixed;
      z-index: 10000;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    }
    
    .initials-explainer-modal-content {
      background-color: white;
      border-radius: 8px;
      width: 60%;
      max-width: 600px;
      max-height: 80%;
      overflow-y: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .initials-explainer-modal-header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    
    .initials-explainer-modal-title {
      font-weight: bold;
      font-size: 18px;
    }
    
    .initials-explainer-modal-close {
      cursor: pointer;
      font-size: 24px;
    }
    
    .initials-explainer-modal-body {
      padding: 20px;
      line-height: 1.5;
    }
    
    .initials-explainer-modal-footer {
      padding: 10px 15px;
      border-top: 1px solid #eee;
      text-align: right;
      font-size: 12px;
      color: #888;
    }
    
    .initials-explainer-loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: initials-explainer-spin 2s linear infinite;
      margin: 20px auto;
    }
    
    @keyframes initials-explainer-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .initials-explainer-button {
      background-color: #4285f4;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .initials-explainer-button:hover {
      background-color: #3367d6;
    }
  `;
  
  document.head.appendChild(style);
}

// Function to update the modal content with the explanation
function updateModalContent(explanation) {
  if (!modal) return;
  
  const modalBody = modal.querySelector('.initials-explainer-modal-body');
  modalBody.innerHTML = `<p>${explanation}</p>`;
}

// Function to call the AI API to get the explanation
async function getExplanation(initials, context, config) {
  try {
    // Choose the API service based on configuration
    if (config.apiService === 'openai') {
      return await callOpenAI(initials, context, config.apiKey);
    }
    // Add other API services here as needed
    
    return "Unknown API service selected.";
  } catch (error) {
    console.error('Error calling AI API:', error);
    return "Sorry, I couldn't get an explanation at this time. Please check your API key and try again.";
  }
}

// Function to call OpenAI API
async function callOpenAI(initials, context, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that explains the meaning of initials or acronyms based on context from a webpage."
        },
        {
          role: "user",
          content: `Based on the following webpage context, explain what the initials "${initials}" most likely mean:\n\n${context}`
        }
      ],
      max_tokens: 150
    })
  });
  
  const data = await response.json();
  
  // Check for errors
  if (data.error) {
    throw new Error(data.error.message || "Error calling OpenAI API");
  }
  
  return data.choices[0].message.content;
}
