// Log when content script loads
console.log("Email Writer Extension - Content Script Loaded");

// Creates AI button with Gmail's styling classes
function createAIButton(){
   const button = document.createElement('div');   // Add right margin spacing
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3'; // Gmail button classes
   button.style.marginRight = '8px'; 
   button.innerHTML = 'AI Reply';   // Set button text
   button.setAttribute('role','button');   // Add accessibility role
   button.setAttribute('data-tooltip','Generate AI Reply');   // Add hover tooltip
   return button;
}

function getEmailContent(){
    // CSS selectors to find email content in Gmail
    const selectors = [
        '.h7',   // Original message class
        '.a3s.ail', // Email body content
        'gmail_quote',// Quoted text
        '[role="presentation"]' // General content wrapper
    ]
    // Try each selector until email content is found
    for (const selector of selectors) {
        const content = document.querySelector(selector)
        {
            if(content)
            { // Return trimmed text content if found
                return content.innerText.trim();
            }
        }
        // Return empty string if no content found
        return ''; 
    }

}
// Find Gmail's compose toolbar using various possible selectors
function findComposeToolbar(){
    // CSS selectors for Gmail's compose toolbar 
    const selectors = [
        '.btC',   // Gmail toolbar selectors
        '.aDh',
        '[role="toolbar]',
        '.gU.Up'
    ]
    // Try each selector until toolbar is found
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector)
        {
            if(toolbar)
            {
                return toolbar;
            }
        }
        return null; 
    }

}

// Inject AI button into Gmail's compose window
function injectButton(){
   // Remove any existing AI button
    const existingButton = document.querySelector('.ai-reply-button');
    if(existingButton) existingButton.remove();

    // Find Gmail's compose toolbar
    const toolbar = findComposeToolbar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;
    }
    
    // Create and setup the AI button
    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');
    // Add click handler for AI generation
    button.addEventListener('click', async() => {
        try {
            // Update button state while generating
            button.innerHTML = 'Generating...';
            button.disabled = true;
           // Get email content to generate reply for
           const emailContent = getEmailContent();
           // Make API request to generate reply
           const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    emailContent : emailContent,
                    tone : "professional"

                })
            });
            // Handle failed API response
            if(!response.ok){
                throw new Error('API Request Failed');
            }
            // Get generated reply text
            const generatedReply= await response.text();
            // Find Gmail's compose box
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            // Insert generated text into compose box
            if(composeBox){
                composeBox.focus(); // Put cursor in compose box
                document.execCommand('insertText', false, generatedReply); // Insert text at cursor
              // false = don't show UI for this operation  
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            // Handle any errors
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            // Reset button state
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }

    });
    // Add button to toolbar
    toolbar.insertBefore(button, toolbar.firstChild);
}
// Watch for changes in Gmail's DOM to detect compose window
const observer = new MutationObserver((mutations) => {
    // Check each DOM change
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        // Check if compose window elements are added
        const hasComposedElement = addedNodes.some((node) => 
            node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        // When compose window appears, inject button 
        if(hasComposedElement){
           console.log("Compose Window Detected");
           setTimeout(injectButton, 500); // Delay to ensure DOM is ready
        }
    }
});

// Start observing DOM changes
observer.observe(document.body, {
    childList: true, // Watch for added/removed nodes
    subtree : true   // Watch all descendants
})