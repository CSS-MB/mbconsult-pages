/**
 * Contact Form Handler for MB CONSULT
 * 
 * This script handles direct submission to Power Automate Flow.
 * 
 * SECURITY NOTES:
 * - Flow URL is a bearer secret; consider moving to proxy if spam spikes
 * - Current anti-spam: honeypot field + timing check (300ms minimum)
 * - Potential enhancements: Cloudflare Turnstile, server-side rate limiting, content length caps
 * 
 * TO ROTATE FLOW URL:
 * 1. Update FLOW_URL constant below with new Power Automate trigger URL
 * 2. Test form submission to verify new endpoint works
 * 3. Monitor for any errors in browser console
 * 
 * TO MIGRATE TO PROXY LATER:
 * 1. Set up Azure Function or Cloudflare Worker as proxy
 * 2. Update FLOW_URL to point to proxy endpoint
 * 3. Proxy should validate, rate-limit, then forward to real Flow URL
 */

// Power Automate Flow endpoint - rotate this if abuse occurs
const FLOW_URL = 'https://defaultb72c4bc8430f4822b477a1ae1f3c52.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/126065c601a24faaa4d2fe201b152980/triggers/manual/paths/invoke/?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-jezMV5QDTQ5AnlEY-17zMGXzR00wGyEBpbizVj5gXw';

// Track page load time for anti-bot timing check
const pageLoadTime = Date.now();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Initialize contact form handlers when DOM is ready
 */
function initializeContactForms() {
    // Find all forms that contain name, email, and message fields
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const nameField = form.querySelector('#name, input[name="name"]');
        const emailField = form.querySelector('#email, input[name="email"]');
        const messageField = form.querySelector('#message, textarea[name="message"]');
        
        // Only process forms that have all three required fields
        if (nameField && emailField && messageField) {
            initializeContactForm(form, nameField, emailField, messageField);
        }
    });
}

// Initialize forms when DOM is ready, or immediately if already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForms);
} else {
    // DOM is already ready
    initializeContactForms();
}

/**
 * Set up a contact form with spam protection and submission handling
 */
function initializeContactForm(form, nameField, emailField, messageField) {
    // Inject honeypot field (hidden company field for spam detection)
    const honeypotField = document.createElement('input');
    honeypotField.type = 'text';
    honeypotField.name = 'company';
    honeypotField.style.display = 'none';
    honeypotField.style.visibility = 'hidden';
    honeypotField.style.position = 'absolute';
    honeypotField.style.left = '-9999px';
    honeypotField.tabIndex = -1;
    honeypotField.autocomplete = 'off';
    form.appendChild(honeypotField);
    
    // Find submit button
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"], .button.submit');
    
    // Override the jQuery click handler for submit buttons in this form
    // The main.js file intercepts clicks on .submit and calls form.submit() directly
    // We need to prevent that and use our own handler
    if (submitButton && submitButton.classList.contains('submit')) {
        // Remove any existing jQuery event handlers by cloning and replacing the button
        // This is necessary because jQuery's click handler bypasses form submit events
        const newButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(newButton, submitButton);
        
        // Add our click handler to the new button
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Call our submit handler
            await handleFormSubmission(form, nameField, emailField, messageField, newButton, honeypotField);
        });
    } else {
        // For forms without .submit class, use regular form submit handler
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleFormSubmission(form, nameField, emailField, messageField, submitButton, honeypotField);
        });
    }
}

/**
 * Handle form submission with all validation and API call
 */
async function handleFormSubmission(form, nameField, emailField, messageField, submitButton, honeypotField) {
    // Anti-bot timing check - ignore submissions < 300ms after page load
    const timeSinceLoad = Date.now() - pageLoadTime;
    if (timeSinceLoad < 300) {
        // Silent success for obvious bots
        showSuccessMessage();
        resetForm(form, submitButton);
        return;
    }
    
    // Honeypot check - if company field is filled, it's spam
    if (honeypotField.value.trim() !== '') {
        // Silent success for spam
        showSuccessMessage();
        resetForm(form, submitButton);
        return;
    }
    
    // Get form data
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();
    
    // Validate required fields
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Validate email format
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Disable submit button during submission
    if (submitButton) {
        submitButton.disabled = true;
        const originalText = submitButton.textContent || submitButton.value;
        if (submitButton.textContent !== undefined) {
            submitButton.textContent = 'Sending...';
        } else {
            submitButton.value = 'Sending...';
        }
        
        // Store original text for restoration
        submitButton.dataset.originalText = originalText;
    }
    
    try {
        // Submit to Power Automate Flow
        const response = await fetch(FLOW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });
        
        // Handle response
        if (response.ok || response.status === 202) {
            // Success (200 OK or 202 Accepted)
            showSuccessMessage();
            resetForm(form, submitButton);
        } else {
            // HTTP error
            throw new Error(`Server responded with status ${response.status}`);
        }
        
    } catch (error) {
        // Network error or other failure
        console.error('Contact form submission error:', error);
        alert('Oops, something went wrong. Please try again or contact us directly.');
        
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            const originalText = submitButton.dataset.originalText || 'Send Message';
            if (submitButton.textContent !== undefined) {
                submitButton.textContent = originalText;
            } else {
                submitButton.value = originalText;
            }
        }
    }
}

/**
 * Show success message to user
 */
function showSuccessMessage() {
    alert('Message sent! Thank you for contacting MB CONSULT. We will get back to you soon.');
}

/**
 * Reset form and restore submit button
 */
function resetForm(form, submitButton) {
    // Reset form fields
    form.reset();
    
    // Restore submit button
    if (submitButton) {
        submitButton.disabled = false;
        const originalText = submitButton.dataset.originalText || 'Send Message';
        if (submitButton.textContent !== undefined) {
            submitButton.textContent = originalText;
        } else {
            submitButton.value = originalText;
        }
    }
}