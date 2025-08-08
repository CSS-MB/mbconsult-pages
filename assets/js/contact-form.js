/**
 * Unified Contact Form Handler for MB CONSULT
 *
 * Finds every <form class="contact-form"> and wires submit behavior:
 *  - Client-side validation (required + email format)
 *  - Honeypot spam field (#company) silent success
 *  - Graceful UI disable/restore of submit button
 *  - Robust fetch with JSON fallback
 */

(function () {
  'use strict';

  // Azure Function endpoint
  const ENDPOINT = "https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler";

  // Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function initializeContactForms() {
    const forms = document.querySelectorAll('form.contact-form');
    forms.forEach(setupFormHandler);
  }

  function setupFormHandler(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Field resolution (support either id or name attributes)
      const nameField = form.querySelector('#name, input[name="name"]');
      const emailField = form.querySelector('#email, input[name="email"]');
      const messageField = form.querySelector('#message, textarea[name="message"]');
      const honeypotField = form.querySelector('#company, input[name="company"]');

      if (!nameField || !emailField || !messageField) {
        console.error('Contact form missing required fields');
        return;
      }

      const name = (nameField.value || '').trim();
      const email = (emailField.value || '').trim();
      const message = (messageField.value || '').trim();
      const honeypot = honeypotField ? (honeypotField.value || '').trim() : "";

      // Required validation
      if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
      }

      // Email validation
      if (!EMAIL_REGEX.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Honeypot – silent accept
      if (honeypot !== "") {
        alert("Message sent! Thank you for contacting MB CONSULT.");
        form.reset();
        return;
      }

      // Submit button handling
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      let originalText = "";
      if (submitButton) {
        originalText = submitButton.textContent !== undefined ? submitButton.textContent : submitButton.value;
        submitButton.disabled = true;
        if (submitButton.textContent !== undefined) {
          submitButton.textContent = "Sending...";
        } else {
          submitButton.value = "Sending...";
        }
      }

      const payload = { name, email, message };

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Server responded with status: " + response.status);
        }

        let result = null;
        try {
          result = await response.json();
        } catch (_) {
          // Non-JSON; proceed as success
        }

        if (result && result.success === false) {
          throw new Error(result.errors ? result.errors.join("; ") : (result.message || "Unknown error"));
        }

        alert("Message sent! Thank you for contacting MB CONSULT.");
        form.reset();

      } catch (err) {
        console.error("Form submission error:", err);
        alert("Sorry, there was an error sending your message. Please try again later or contact us directly at support@mbconsult.io");
      } finally {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForms);
  } else {
    initializeContactForms();
  }
})();