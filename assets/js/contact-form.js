/**
 * Unified Contact Form Handler for MB CONSULT
 * 
 * Handles contact forms with data-contact-form attribute.
 * Provides client-side validation, honeypot protection, and Azure Function integration.
 */

// Azure Function endpoint
const CONTACT_ENDPOINT = "https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize contact forms when DOM is ready
function initializeContactForms() {
    const forms = document.querySelectorAll('form[data-contact-form]');
    
    forms.forEach(form => {
        setupContactForm(form);
    });
}

// Set up individual contact form
function setupContactForm(form) {
    // Ensure honeypot field exists
    let honeypotField = form.querySelector('input[name="company"]');
    if (!honeypotField) {
        honeypotField = document.createElement('input');
        honeypotField.type = 'text';
        honeypotField.name = 'company';
        honeypotField.id = 'company';
        honeypotField.style.display = 'none';
        honeypotField.style.visibility = 'hidden';
        honeypotField.style.position = 'absolute';
        honeypotField.style.left = '-9999px';
        honeypotField.tabIndex = -1;
        honeypotField.autocomplete = 'off';
        form.appendChild(honeypotField);
    }

    // Add form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleFormSubmission(form);
    });
}

// Handle form submission
async function handleFormSubmission(form) {
    // Get form fields
    const nameField = form.querySelector('input[name="name"], #name');
    const emailField = form.querySelector('input[name="email"], #email');
    const messageField = form.querySelector('textarea[name="message"], #message');
    const honeypotField = form.querySelector('input[name="company"]');
    
    if (!nameField || !emailField || !messageField) {
        alert('Form configuration error. Please contact us directly.');
        return;
    }

    // Get form data
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();
    const company = honeypotField ? honeypotField.value.trim() : '';

    // Client-side validation
    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!EMAIL_REGEX.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Honeypot check (silent rejection to avoid training bots)
    if (company !== '') {
        alert('Message sent! Thank you for contacting MB CONSULT.');
        form.reset();
        return;
    }

    // Find and update submit button
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"], .button.submit');
    let originalText = '';
    
    if (submitButton) {
        submitButton.disabled = true;
        if (submitButton.textContent !== undefined) {
            originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
        } else if (submitButton.value !== undefined) {
            originalText = submitButton.value;
            submitButton.value = 'Sending...';
        }
    }

    try {
        // Submit to Azure Function
        const response = await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                company: company
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success
            alert('Message sent! Thank you for contacting MB CONSULT. We will get back to you soon.');
            form.reset();
        } else if (response.status === 400 && result.errors) {
            // Validation errors
            alert('Please fix the following errors:\n\n' + result.errors.join('\n'));
        } else {
            // Other errors
            throw new Error(result.error || result.message || 'Server error');
        }

    } catch (error) {
        console.error('Contact form submission error:', error);
        alert('Sorry, there was an error sending your message. Please try again later or contact us directly at support@mbconsult.io');
    } finally {
        // Restore submit button
        if (submitButton) {
            submitButton.disabled = false;
            if (submitButton.textContent !== undefined) {
                submitButton.textContent = originalText || 'Send Message';
            } else if (submitButton.value !== undefined) {
                submitButton.value = originalText || 'Send Message';
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForms);
} else {
    initializeContactForms();
}