/**
 * Contact Form Handler for MB CONSULT
 * 
 * Shared module for handling contact form submissions across all pages.
 * Automatically finds forms with class "contact-form" and handles submission,
 * validation, honeypot spam protection, and user feedback.
 */

(function() {
  'use strict';

  // Azure Function endpoint
  const ENDPOINT = "https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler";
  
  // Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Initialize contact form handlers when DOM is ready
   */
  function initializeContactForms() {
    // Find all forms with the contact-form class
    const forms = document.querySelectorAll('form.contact-form');
    
    forms.forEach(form => {
      setupFormHandler(form);
    });
  }

  /**
   * Set up form submission handler for a specific form
   */
  function setupFormHandler(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const nameField = form.querySelector('input[name="name"]');
      const emailField = form.querySelector('input[name="email"]');
      const messageField = form.querySelector('textarea[name="message"]');
      const honeypotField = form.querySelector('input[name="company"]');
      
      if (!nameField || !emailField || !messageField) {
        console.error('Contact form missing required fields');
        return;
      }
      
      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();
      const honeypot = honeypotField ? honeypotField.value.trim() : "";
      
      // Client-side validation
      if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
      }
      
      // Email validation
      if (!EMAIL_REGEX.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      
      // Honeypot check (anti-spam)
      if (honeypot !== "") {
        // Silently reject spam but appear successful
        alert("Message sent! Thank you for contacting MB CONSULT.");
        form.reset();
        return;
      }
      
      // Find submit button and show loading state
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      let originalText = "";
      
      if (submitButton) {
        originalText = submitButton.textContent || submitButton.value;
        submitButton.disabled = true;
        
        if (submitButton.textContent !== undefined) {
          submitButton.textContent = "Sending...";
        } else {
          submitButton.value = "Sending...";
        }
      }
      
      // Prepare data payload
      const data = { name, email, message };
      
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          // Try to parse JSON response
          try {
            const result = await response.json();
            if (result.success) {
              alert("Message sent! Thank you for contacting MB CONSULT.");
              form.reset();
            } else {
              throw new Error(result.message || "Server responded with an error");
            }
          } catch (jsonError) {
            // Fallback for non-JSON responses
            alert("Message sent! Thank you for contacting MB CONSULT.");
            form.reset();
          }
        } else {
          throw new Error("Server responded with status: " + response.status);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        alert("Sorry, there was an error sending your message. Please try again later or contact us directly at support@mbconsult.io");
      } finally {
        // Restore button state
        if (submitButton) {
          submitButton.disabled = false;
          if (submitButton.textContent !== undefined) {
            submitButton.textContent = originalText;
          } else {
            submitButton.value = originalText;
          }
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForms);
  } else {
    // DOM is already ready
    initializeContactForms();
  }
})();