/**
 * Unified Contact Form Handler for MB CONSULT
 * 
 * Handles form submission for all contact forms on the site with:
 * - Client-side validation
 * - CORS-enabled Azure Function integration
 * - Honeypot spam protection
 * - Unified UX states (loading, success, error)
 * - JSON error handling
 */

(function() {
  'use strict';

  // Azure Function endpoint
  const CONTACT_ENDPOINT = "https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler";
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Initialize all contact forms on page load
   */
  function initializeContactForms() {
    const forms = document.querySelectorAll('.contact-form');
    
    forms.forEach(form => {
      setupFormHandler(form);
    });
  }

  /**
   * Setup form submission handler for a single form
   */
  function setupFormHandler(form) {
    // Remove submit class from buttons to prevent jQuery interference
    const submitButtons = form.querySelectorAll('.submit');
    submitButtons.forEach(button => {
      button.classList.remove('submit');
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      await handleFormSubmission(form);
    });
  }

  /**
   * Handle form submission with validation and API call
   */
  async function handleFormSubmission(form) {
    // Get form fields
    const nameField = form.querySelector('#name, input[name="name"]');
    const emailField = form.querySelector('#email, input[name="email"]');
    const messageField = form.querySelector('#message, textarea[name="message"]');
    const honeypotField = form.querySelector('input[name="company"]');
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

    if (!nameField || !emailField || !messageField) {
      console.error('Contact form missing required fields');
      return;
    }

    // Get values
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();
    const company = honeypotField ? honeypotField.value : '';

    // Client-side validation
    clearValidationMessages();
    
    const errors = [];
    
    if (!name || name.length < 2) {
      errors.push('Please enter your name (at least 2 characters)');
    }
    
    if (!email) {
      errors.push('Please enter your email address');
    } else if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!message || message.length < 10) {
      errors.push('Please enter a message (at least 10 characters)');
    }

    if (errors.length > 0) {
      showValidationErrors(errors);
      return;
    }

    // Set loading state
    setLoadingState(submitButton, true);

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
        showSuccessMessage();
        resetForm(form);
      } else {
        // Server validation errors or other issues
        if (result.errors && Array.isArray(result.errors)) {
          showValidationErrors(result.errors);
        } else {
          showErrorMessage(result.error || 'Server error occurred. Please try again.');
        }
      }

    } catch (error) {
      console.error('Contact form submission error:', error);
      showErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoadingState(submitButton, false);
    }
  }

  /**
   * Set loading state on submit button
   */
  function setLoadingState(button, loading) {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent || button.value;
      button.disabled = true;
      
      if (button.textContent !== undefined) {
        button.textContent = 'Sending...';
      } else {
        button.value = 'Sending...';
      }
    } else {
      button.disabled = false;
      const originalText = button.dataset.originalText || 'Send Message';
      
      if (button.textContent !== undefined) {
        button.textContent = originalText;
      } else {
        button.value = originalText;
      }
    }
  }

  /**
   * Show validation errors to user
   */
  function showValidationErrors(errors) {
    const message = errors.length === 1 ? errors[0] : 
      'Please fix the following:\n• ' + errors.join('\n• ');
    alert(message);
  }

  /**
   * Show generic error message
   */
  function showErrorMessage(message) {
    alert('Error: ' + message);
  }

  /**
   * Show success message
   */
  function showSuccessMessage() {
    alert('Message sent! Thank you for contacting MB CONSULT. We will get back to you soon.');
  }

  /**
   * Clear any validation messages
   */
  function clearValidationMessages() {
    // Could be enhanced to clear visual validation indicators
    // For now, just ensuring clean state for alerts
  }

  /**
   * Reset form to initial state
   */
  function resetForm(form) {
    form.reset();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForms);
  } else {
    initializeContactForms();
  }

})();