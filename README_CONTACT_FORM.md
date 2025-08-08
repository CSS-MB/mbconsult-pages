# Contact Form Documentation

## Current Architecture

The MB CONSULT website contact forms now submit directly to a Microsoft Power Automate Flow endpoint. This replaces the previous Azure Function endpoint that was experiencing issues.

### Form Locations
- **Homepage** (`index.html`): "Get in Touch" section
- **Services Page** (`elements.html`): "Contact Us" section

### Technical Implementation
- **Handler**: `assets/js/contact.js` - Shared JavaScript for both forms
- **Endpoint**: Power Automate Flow HTTP trigger URL
- **Method**: POST with JSON payload: `{ name, email, message }`

## Security Features

### Anti-Spam Protection
1. **Honeypot Field**: Hidden "company" input field automatically added to forms
   - If filled by bots, submission is silently treated as success without calling the Flow
   - Field is completely hidden via CSS and positioned off-screen
   
2. **Timing Check**: Submissions under 300ms after page load are rejected
   - Prevents obvious scripted attacks
   - Rejected submissions show success message to avoid revealing the check

3. **Email Validation**: Basic regex validation for email format
4. **Required Field Validation**: All fields must be non-empty

### User Experience
- Submit button is disabled during form submission
- Button text changes to "Sending..." while processing
- Clear success/error messages
- Form is reset after successful submission

## Security Risks and Mitigation

### Current Risks
⚠️ **Flow URL Exposure**: The Power Automate endpoint URL is visible in client-side JavaScript and can be extracted by viewing page source.

### Recommended Mitigations

#### Immediate (if abuse occurs):
1. **Rotate Flow URL**: Follow steps below to generate new endpoint
2. **Monitor Flow execution**: Check Power Automate run history for spam

#### Future Enhancements:
1. **Proxy Implementation**: Set up Azure Function or Cloudflare Worker as proxy
2. **Rate Limiting**: Implement server-side request throttling
3. **Content Length Caps**: Limit message field length
4. **Advanced Bot Protection**: Consider Cloudflare Turnstile or similar
5. **IP-based Rate Limiting**: Block repeat offenders

## Operations Guide

### Rotating the Flow URL

If the current endpoint experiences abuse:

1. **In Power Automate**:
   - Open the Flow: "Contact Form Submissions" 
   - Go to the HTTP Request trigger
   - Click "Copy HTTP URL" to get new URL
   - Save the Flow to regenerate the signature

2. **Update Website**:
   - Edit `assets/js/contact.js`
   - Update the `FLOW_URL` constant (line ~20)
   - Test form submission on staging/local environment
   - Deploy updated file

3. **Verify**:
   - Submit test form on live site
   - Check Power Automate run history
   - Monitor for any console errors

### Migrating to Proxy Architecture

For enhanced security, consider implementing a proxy:

#### Option 1: Azure Function Proxy
```javascript
// Azure Function example
module.exports = async function (context, req) {
    // Validate request rate limiting, content filtering
    if (!rateLimitCheck(req.ip)) {
        context.res = { status: 429, body: "Too many requests" };
        return;
    }
    
    // Forward to actual Flow URL (stored in environment variables)
    const response = await fetch(process.env.FLOW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    
    context.res = { status: response.status };
};
```

#### Option 2: Cloudflare Worker Proxy
```javascript
// Cloudflare Worker example
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    // Add rate limiting, validation, etc.
    const response = await fetch(FLOW_URL, {
        method: 'POST',
        headers: request.headers,
        body: request.body
    });
    return response;
}
```

### Monitoring and Troubleshooting

#### Common Issues:
1. **CORS Errors**: Power Automate should handle CORS automatically
2. **Network Timeouts**: Flow may take 10-30 seconds to respond
3. **Validation Errors**: Check browser console for JavaScript errors

#### Monitoring:
- **Power Automate**: Check run history for failed executions
- **Browser Console**: Monitor for JavaScript errors
- **User Reports**: Track support emails about form submission issues

#### Debug Steps:
1. Open browser developer tools
2. Submit form and check Network tab
3. Look for HTTP response codes:
   - `200/202`: Success
   - `400`: Bad request (malformed JSON)
   - `429`: Rate limited
   - `500`: Flow internal error

## Form Field Specifications

### Required Fields
- **name**: Text input, required, trimmed
- **email**: Email input, required, validated with regex
- **message**: Textarea, required, trimmed

### Automatically Added Fields
- **company**: Hidden honeypot field for spam detection

### Validation Rules
- All fields must be non-empty after trimming
- Email must match pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- No length limits currently enforced (consider adding)

## Testing

### Manual Testing Checklist
- [ ] Form loads without JavaScript errors
- [ ] Honeypot field is present but hidden
- [ ] Validation prevents empty submissions
- [ ] Validation prevents invalid email formats
- [ ] Submit button disables during submission
- [ ] Success message appears after valid submission
- [ ] Form resets after successful submission
- [ ] Error handling works for network failures

### Test Cases
1. **Valid Submission**: Fill all fields correctly, verify success
2. **Empty Fields**: Try submitting with missing fields
3. **Invalid Email**: Test with malformed email addresses
4. **Honeypot Trigger**: Programmatically fill company field
5. **Network Error**: Block network request and test error handling

## Contact Information

For technical issues with the contact form:
- **Primary**: Development team
- **Secondary**: Power Automate admin
- **Emergency**: Direct email to support@mbconsult.io