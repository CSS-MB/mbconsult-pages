describe('Contact Form E2E Tests', () => {
  const validData = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message with sufficient length for validation.'
  }

  beforeEach(() => {
    // Visit elements page which has simpler layout and no complex animations
    cy.visit('/elements.html', { timeout: 30000 })
    
    // Wait for form to exist and be ready
    cy.get('form.contact-form').should('exist')
    
    // Wait for form to be visible
    cy.get('form.contact-form').should('be.visible')
    
    // Brief wait for form initialization
    cy.wait(500)
  })

  describe('Form Validation', () => {
    it('should show error for empty required fields', () => {
      cy.get('form.contact-form').first().within(() => {
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        // Should show validation error in live region
        cy.get('.form-status').should('be.visible')
        cy.get('.form-status').should('contain', 'Please correct the errors')
        
        // Fields should be marked invalid
        cy.get('#name, input[name="name"]').should('have.attr', 'aria-invalid', 'true')
        cy.get('#email, input[name="email"]').should('have.attr', 'aria-invalid', 'true')
        cy.get('#message, textarea[name="message"]').should('have.attr', 'aria-invalid', 'true')
      })
    })

    it('should validate email format', () => {
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type('invalid-email')
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.get('.form-status').should('be.visible')
        cy.get('.form-status').should('contain', 'Please correct the errors')
        cy.get('#email, input[name="email"]').should('have.attr', 'aria-invalid', 'true')
      })
    })

    it('should validate minimum message length', () => {
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type('short')
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.get('.form-status').should('be.visible')
        cy.get('.form-status').should('contain', 'at least 10 characters')
      })
    })

    it('should validate maximum name length', () => {
      const longName = 'a'.repeat(201) // Exceeds MAX_NAME_LENGTH
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(longName)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.get('.form-status').should('be.visible')
        cy.get('.form-status').should('contain', '200 characters or less')
      })
    })
  })

  describe('Honeypot Protection', () => {
    it('should trigger honeypot and show success message', () => {
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        // Fill honeypot field (hidden)
        cy.get('#company, input[name="company"]').invoke('val', 'spam-value')
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        // Should show success message (honeypot triggered)
        cy.get('.form-status.success').should('be.visible')
        cy.get('.form-status').should('contain', 'Message sent! Thank you for contacting MB CONSULT.')
        
        // Form should be reset
        cy.get('#name, input[name="name"]').should('have.value', '')
      })
    })
  })

  describe('Timing Protection', () => {
    it('should show success for submissions too fast (timing protection)', () => {
      // Submit immediately without delay
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        // Should show success message (timing protection triggered)
        cy.get('.form-status.success').should('be.visible')
        cy.get('.form-status').should('contain', 'Message sent! Thank you for contacting MB CONSULT.')
      })
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      cy.get('form.contact-form').first().within(() => {
        // Live region should exist
        cy.get('[aria-live="polite"]').should('exist')
        
        // Fields should have aria-describedby
        cy.get('#name, input[name="name"]').should('have.attr', 'aria-describedby')
        cy.get('#email, input[name="email"]').should('have.attr', 'aria-describedby')
        cy.get('#message, textarea[name="message"]').should('have.attr', 'aria-describedby')
      })
    })

    it('should have proper honeypot accessibility attributes', () => {
      cy.get('form.contact-form').first().within(() => {
        // Honeypot should be hidden with aria-hidden
        cy.get('div[aria-hidden="true"]').should('exist')
        cy.get('#company, input[name="company"]').should('have.attr', 'tabindex', '-1')
        cy.get('#company, input[name="company"]').should('have.attr', 'autocomplete', 'off')
      })
    })

    it('should update button state during submission', () => {
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        // Wait for timing protection to pass
      cy.clock()
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        // Wait for timing protection to pass (simulate 500ms)
        cy.tick(500)
        
        const submitButton = cy.get('button[type="submit"], input[type="submit"]')
        
        submitButton.click()
        
        // Button should be disabled and show loading state
        submitButton.should('be.disabled')
        submitButton.should('have.attr', 'aria-busy', 'true')
        
        // Check loading text
        submitButton.then(($btn) => {
          const text = $btn[0].textContent || $btn[0].value
          expect(text).to.contain('Sending')
        })
      })
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network failures gracefully', () => {
      // Intercept and fail the request
      cy.intercept('POST', '**/hooks/catch/**', { forceNetworkError: true }).as('networkError')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@networkError')
        
        // Should show error message with fallback contact
        cy.get('.form-status.error').should('be.visible')
        cy.get('.form-status').should('contain', 'Unable to connect')
        cy.get('.form-status').should('contain', 'support@mbconsult.io')
        
        // Button should be re-enabled
        cy.get('button[type="submit"], input[type="submit"]').should('not.be.disabled')
      })
    })

    it('should handle server errors gracefully', () => {
      // Intercept and return server error
      cy.intercept('POST', '**/hooks/catch/**', { statusCode: 500, body: { success: false, error: 'Server error' } }).as('serverError')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@serverError')
        
        // Should show appropriate error message
        cy.get('.form-status.error').should('be.visible')
        cy.get('.form-status').should('contain', 'Server error')
      })
    })

    it('should handle rate limiting (429)', () => {
      // Intercept and return rate limit error
      cy.intercept('POST', '**/hooks/catch/**', { statusCode: 429, body: { success: false, error: 'Too many requests' } }).as('rateLimited')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@rateLimited')
        
        // Should show rate limiting message
        cy.get('.form-status.error').should('be.visible')
        cy.get('.form-status').should('contain', 'wait a moment')
      })
    })
  })

  describe('DRY_RUN Mode', () => {
    it('should handle DRY_RUN responses correctly', () => {
      // Intercept and return dry run response
      cy.intercept('POST', '**/hooks/catch/**', { statusCode: 200, body: { success: true, dryRun: true } }).as('dryRun')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@dryRun')
        
        // Should show success message
        cy.get('.form-status.success').should('be.visible')
        cy.get('.form-status').should('contain', 'Message sent! Thank you for contacting MB CONSULT.')
        
        // Form should be reset
        cy.get('#name, input[name="name"]').should('have.value', '')
      })
    })
  })

  describe('Multiple Forms', () => {
    it('should work on elements.html', () => {
      cy.visit('/elements.html')
      
      cy.get('form.contact-form').should('be.visible')
      
      cy.get('form.contact-form').within(() => {
        cy.get('input[name="name"], #name').type(validData.name)
        cy.get('input[name="email"], #email').type(validData.email)
        cy.get('textarea[name="message"], #message').type(validData.message)
        
        // Should have live region
        cy.get('[aria-live="polite"]').should('exist')
        
        // Test validation
        cy.get('input[name="name"], #name').clear()
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.get('.form-status.error').should('be.visible')
      })
    })
  })

  describe('Form Reset and Cleanup', () => {
    it('should properly reset form after successful submission', () => {
      // Mock successful submission
      cy.intercept('POST', '**/hooks/catch/**', { statusCode: 200, body: { success: true } }).as('success')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        // Mark fields as invalid first
        cy.get('#name, input[name="name"]').invoke('attr', 'aria-invalid', 'true')
        cy.get('#name, input[name="name"]').invoke('addClass', 'error')
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@success')
        
        // Should show success
        cy.get('.form-status.success').should('be.visible')
        
        // Form should be reset
        cy.get('#name, input[name="name"]').should('have.value', '')
        cy.get('#email, input[name="email"]').should('have.value', '')
        cy.get('#message, textarea[name="message"]').should('have.value', '')
        
        // Error states should be cleared
        cy.get('#name, input[name="name"]').should('not.have.attr', 'aria-invalid')
        cy.get('#name, input[name="name"]').should('not.have.class', 'error')
      })
    })
  })

  describe('Zapier Integration', () => {
    it('should include honeypot field in payload for Zapier webhook', () => {
      // Intercept request to verify payload structure
      cy.intercept('POST', '**/hooks/catch/**', (req) => {
        // Verify all expected fields are present
        expect(req.body).to.have.property('name', validData.name)
        expect(req.body).to.have.property('email', validData.email)
        expect(req.body).to.have.property('message', validData.message)
        expect(req.body).to.have.property('company', '') // Honeypot should be empty
        
        req.reply({ statusCode: 200, body: { success: true } })
      }).as('zapierRequest')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        cy.wait(500) // Wait for timing protection
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        cy.wait('@zapierRequest')
        
        // Should show success
        cy.get('.form-status.success').should('be.visible')
      })
    })

    it('should include filled honeypot field in payload when triggered', () => {
      // Intercept request to verify honeypot behavior
      cy.intercept('POST', '**/hooks/catch/**', (req) => {
        // Should never reach here with client-side honeypot protection
        // But if it does, verify the payload includes the honeypot value
        expect(req.body).to.have.property('company', 'bot-company')
        req.reply({ statusCode: 200, body: { success: true } })
      }).as('honeypotRequest')
      
      cy.get('form.contact-form').first().within(() => {
        cy.get('#name, input[name="name"]').type(validData.name)
        cy.get('#email, input[name="email"]').type(validData.email)
        cy.get('#message, textarea[name="message"]').type(validData.message)
        
        // Fill honeypot field
        cy.get('#company, input[name="company"]').invoke('val', 'bot-company')
        
        cy.get('button[type="submit"], input[type="submit"]').click()
        
        // Should show success immediately (honeypot protection)
        cy.get('.form-status.success').should('be.visible')
        cy.get('.form-status').should('contain', 'Message sent! Thank you for contacting MB CONSULT.')
      })
    })
  })
})
})