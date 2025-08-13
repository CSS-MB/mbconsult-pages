/**
 * Enhanced Contact Form Handler for MB CONSULT
 *
 * Provides robust, accessible form handling with:
 *  - Complete client-side validation with accessible error messages
 *  - ARIA live regions for screen reader feedback
 *  - Honeypot anti-spam protection
 *  - Rate limiting and timing validation
 *  - Graceful error handling and recovery
 *  - Secure submission to Zapier webhook
 */

(function () {
  'use strict';

  // Configuration
  // Load ENDPOINT from global variable, fallback to null
  let ENDPOINT = window.CONTACT_FORM_ENDPOINT || null;
  const SHARED_TOKEN = "MBConsult2024!ContactFormSecret"; // Security header token
  // Security header token will be loaded from meta tag
  let SHARED_TOKEN = null;
  let SHARED_TOKEN = null;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Load security token from meta tag
  function loadSharedToken() {
    const meta = document.querySelector('meta[name="contact-form-token"]');
    if (meta && meta.content) {
      SHARED_TOKEN = meta.content;
    } else {
      SHARED_TOKEN = null;
      console.warn("Contact form security token meta tag not found.");
    }
  }
  // Load token on script initialization
  loadSharedToken();
  const MIN_MESSAGE_LENGTH = 10;
  const MAX_MESSAGE_LENGTH = 4000;
  const MAX_NAME_LENGTH = 200;
  const MIN_TIMING_MS = 300; // Prevent too-fast submissions
  const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout
  const MAX_RETRIES = 2; // Retry failed requests
  const SUPPORT_EMAIL = "support@mbconsult.io"

  // Track form initialization time for timing validation
  const formTimings = new WeakMap();

  // Fetch with timeout and retry logic
  async function fetchWithRetry(url, options, retries = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If this was an abort due to timeout or network error, retry
      if (retries > 0 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  function initializeContactForms() {
    const forms = document.querySelectorAll('form.contact-form');
    forms.forEach(setupFormHandler);
  }

  function setupFormHandler(form) {
    // Record initialization time for timing validation
    formTimings.set(form, Date.now());

    // Create ARIA live region for accessibility
    const liveRegion = createLiveRegion(form);

    // Set up real-time validation
    setupFieldValidation(form, liveRegion);

    // Handle form submission
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      await handleFormSubmission(form, liveRegion);
    });
  }

  function createLiveRegion(form) {
    // Create or find existing live region
    let liveRegion = form.querySelector('.form-status[aria-live]');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'form-status';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'margin-top: 1rem; padding: 0.75rem; border-radius: 4px; font-weight: bold; display: none;';
      
      // Try to insert after form fields but before submit button
      const submitContainer = form.querySelector('.actions, .col-12:last-child, ul:last-child');
      if (submitContainer && submitContainer.parentNode === form) {
        try {
          form.insertBefore(liveRegion, submitContainer);
        } catch (e) {
          // Fallback: append to end of form
          form.appendChild(liveRegion);
        }
      } else {
        // Fallback: append to end of form
        form.appendChild(liveRegion);
      }
    }
    return liveRegion;
  }

  function setupFieldValidation(form, liveRegion) {
    const nameField = form.querySelector('#name, input[name="name"]');
    const emailField = form.querySelector('#email, input[name="email"]');
    const messageField = form.querySelector('#message, textarea[name="message"]');

    // Add aria-describedby for error announcements
    [nameField, emailField, messageField].forEach(field => {
      if (field) {
        field.setAttribute('aria-describedby', liveRegion.id);
      }
    });

    // Real-time validation on blur
    if (nameField) {
      nameField.addEventListener('blur', () => validateField(nameField, 'name', liveRegion));
    }
    if (emailField) {
      emailField.addEventListener('blur', () => validateField(emailField, 'email', liveRegion));
    }
    if (messageField) {
      messageField.addEventListener('blur', () => validateField(messageField, 'message', liveRegion));
    }
  }

  function validateField(field, type, liveRegion, silent = false) {
    const value = (field.value || '').trim();
    let isValid = true;
    let message = '';

    // Clear previous error state
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');

    switch (type) {
      case 'name':
        if (!value) {
          isValid = false;
          message = 'Name is required.';
        } else if (value.length > MAX_NAME_LENGTH) {
          isValid = false;
          message = `Name must be ${MAX_NAME_LENGTH} characters or less.`;
        }
        break;

      case 'email':
        if (!value) {
          isValid = false;
          message = 'Email address is required.';
        } else if (!EMAIL_REGEX.test(value)) {
          isValid = false;
          message = 'Please enter a valid email address.';
        }
        break;

      case 'message':
        if (!value) {
          isValid = false;
          message = 'Message is required.';
        } else if (value.length < MIN_MESSAGE_LENGTH) {
          isValid = false;
          message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
        } else if (value.length > MAX_MESSAGE_LENGTH) {
          isValid = false;
          message = `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`;
        }
        break;
    }

    if (!isValid) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      if (!silent) {
        showStatus(liveRegion, message, 'error');
      }
    }

    return isValid;
  }

  function validateAllFields(form, liveRegion) {
    const nameField = form.querySelector('#name, input[name="name"]');
    const emailField = form.querySelector('#email, input[name="email"]');
    const messageField = form.querySelector('#message, textarea[name="message"]');

    if (!nameField || !emailField || !messageField) {
      console.error('Contact form missing required fields');
      showStatus(liveRegion, 'Form configuration error. Please contact support.', 'error');
      return false;
    }

    const validations = [
      validateField(nameField, 'name', liveRegion, true),
      validateField(emailField, 'email', liveRegion, true),
      validateField(messageField, 'message', liveRegion, true)
    ];

    const allValid = validations.every(v => v);
    if (!allValid) {
      showStatus(liveRegion, 'Please correct the errors above and try again.', 'error');
      // Focus first invalid field
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }

    return allValid;
  }

  function checkTiming(form) {
    const initTime = formTimings.get(form);
    const elapsed = Date.now() - initTime;
    return elapsed >= MIN_TIMING_MS;
  }

  async function handleFormSubmission(form, liveRegion) {
    // Clear previous status
    clearStatus(liveRegion);

    // Validate all fields
    if (!validateAllFields(form, liveRegion)) {
      return;
    }

    // Check timing (anti-bot)
    if (!checkTiming(form)) {
      // Silent success for timing failures (don't reveal the check)
      showStatus(liveRegion, 'Message sent! Thank you for contacting MB CONSULT.', 'success');
      setTimeout(() => form.reset(), 1000);
      return;
    }

    // Get field values
    const nameField = form.querySelector('#name, input[name="name"]');
    const emailField = form.querySelector('#email, input[name="email"]');
    const messageField = form.querySelector('#message, textarea[name="message"]');
    const honeypotField = form.querySelector('input[name="company"]');

    const name = (nameField.value || '').trim();
    const email = (emailField.value || '').trim();
    const message = (messageField.value || '').trim();
    const honeypot = honeypotField ? (honeypotField.value || '').trim() : "";

    // Honeypot check - silent success
    if (honeypot !== "") {
      showStatus(liveRegion, 'Message sent! Thank you for contacting MB CONSULT.', 'success');
      setTimeout(() => form.reset(), 1000);
      return;
    }

    // Disable submit button and show loading
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalSubmitState = disableSubmitButton(submitButton);
    
    showStatus(liveRegion, 'Sending your message...', 'info');

    try {
      // Include honeypot field and metadata in payload for Zapier to process
      const payload = { 
        name, 
        email, 
        message, 
        company: honeypot,
        submittedAt: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        page: window.location.pathname,
        userAgent: navigator.userAgent
      };

      const response = await fetchWithRetry(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Shared-Token": SHARED_TOKEN
        },
        body: JSON.stringify(payload)
      }, MAX_RETRIES);

      if (!response.ok) {
        // Handle specific HTTP errors
        let errorMessage = 'Unable to send message. ';
        switch (response.status) {
          case 400:
            errorMessage += 'Please check your information and try again.';
            break;
          case 429:
            errorMessage += 'Please wait a moment before sending another message.';
            break;
          case 500:
            errorMessage += 'Server error. Please try again later.';
            break;
          default:
            errorMessage += `Server responded with error ${response.status}.`;
        }
        throw new Error(errorMessage);
      }

      let result = null;
      try {
        result = await response.json();
      } catch (_) {
        // Non-JSON response; treat as success if 2xx
        result = { success: true };
      }

      if (result && result.success === false) {
        const errorMsg = result.errors 
          ? result.errors.join('; ') 
          : (result.error || 'Unknown error occurred');
        throw new Error(errorMsg);
      }

      // Success!
      showStatus(liveRegion, 'Message sent! Thank you for contacting MB CONSULT.', 'success');
      form.reset();
      
      // Clear any error states
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
      });

    } catch (error) {
      console.error("Form submission error:", error);
      
      let userMessage = error.message;
      
      // Provide fallback for network errors
      if (userMessage.includes('fetch') || userMessage.includes('network') || userMessage.includes('NetworkError')) {
        userMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
      }
      
      // Fallback contact method
      if (!userMessage.includes('@')) {
        userMessage += ' You can also contact us directly at ' + SUPPORT_EMAIL;
      }
      
      showStatus(liveRegion, userMessage, 'error');
      
    } finally {
      // Restore submit button
      restoreSubmitButton(submitButton, originalSubmitState);
    }
  }

  function disableSubmitButton(button) {
    if (!button) return null;

    const originalState = {
      disabled: button.disabled,
      text: button.textContent !== undefined ? button.textContent : button.value
    };

    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    
    if (button.textContent !== undefined) {
      button.textContent = "Sending...";
    } else {
      button.value = "Sending...";
    }

    return originalState;
  }

  function restoreSubmitButton(button, originalState) {
    if (!button || !originalState) return;

    button.disabled = originalState.disabled;
    button.removeAttribute('aria-busy');
    
    if (button.textContent !== undefined) {
      button.textContent = originalState.text;
    } else {
      button.value = originalState.text;
    }
  }

  function showStatus(liveRegion, message, type) {
    liveRegion.textContent = message;
    liveRegion.className = `form-status ${type}`;
    
    // Apply appropriate styling
    switch (type) {
      case 'success':
        liveRegion.style.cssText += 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
        break;
      case 'error':
        liveRegion.style.cssText += 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
        break;
      case 'info':
        liveRegion.style.cssText += 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
        break;
    }
    
    liveRegion.style.display = 'block';
  }

  function clearStatus(liveRegion) {
    liveRegion.textContent = '';
    liveRegion.className = 'form-status';
    liveRegion.style.display = 'none';
  }

  // Add basic error styling to head if not present
  function addErrorStyles() {
    if (document.getElementById('contact-form-styles')) return;

    const style = document.createElement('style');
    style.id = 'contact-form-styles';
    style.textContent = `
      .contact-form input.error,
      .contact-form textarea.error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
      }
      .form-status {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 4px;
        font-weight: bold;
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addErrorStyles();
      initializeContactForms();
    });
  } else {
    addErrorStyles();
    initializeContactForms();
  }
})();
