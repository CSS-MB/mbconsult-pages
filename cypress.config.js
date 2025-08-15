const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // Zapier webhook endpoint for testing
      // Test webhook endpoint (do not use production endpoints)
      ENDPOINT: process.env.TEST_WEBHOOK_URL || 'http://localhost:9999/test-webhook'
    }
  }
})