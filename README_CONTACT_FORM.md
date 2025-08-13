# Contact Form Documentation

# Contact Form Documentation

## Current Architecture

The MB CONSULT website contact forms submit directly to a Zapier webhook that processes form submissions and handles email delivery. Client-side validation, security measures, and accessibility features ensure robust form handling.

### Form Locations
- **Homepage** (`index.html`): "Get in Touch" section
- **Services Page** (`elements.html`): "Contact Us" section

### Technical Implementation
- **Frontend Handler**: `assets/js/contact-form.js` - Enhanced accessible form handler with ARIA live regions
- **Backend Service**: Zapier webhook - Serverless form processing and email delivery
- **Method**: POST with JSON payload: `{ name, email, message, company }`
- **Endpoint**: `https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_KEY` (configured in contact-form.js)

## Enhanced Security Features

### Multi-Layer Anti-Spam Protection
1. **Honeypot Field**: Hidden "company" input field automatically added to forms
   - If filled by bots, submission is silently treated as success without processing
   - Field is completely hidden via CSS and positioned off-screen with `aria-hidden="true"`
   - Included in payload for Zapier to filter spam submissions
   
2. **Timing Validation**: Submissions under 300ms after page load are rejected
   - Client-side tracking prevents obvious scripted attacks
   - Rejected submissions show success message to avoid revealing the check

3. **Input Validation**: 
   - Email format validation (client-side)
   - Message length limits (10-4000 characters)
   - Name length limits (2-200 characters)
   - HTML sanitization for display

4. **Enhanced Client-Side Filtering**: All validation performed in browser before submission

### Accessibility Features
- **ARIA Live Regions**: Screen reader announcements for form status updates
- **Progressive Enhancement**: Works without JavaScript for basic submission
- **Keyboard Navigation**: Full keyboard accessibility with proper focus management
- **Error Announcements**: Accessible error messages with `aria-invalid` attributes
- **Loading States**: `aria-busy` attributes during submission
- **No Alert Dialogs**: Uses proper status regions instead of disruptive alerts

### User Experience
- Real-time validation on field blur
- Submit button disabled during processing with loading indication
- Clear success/error messages in accessible status regions
- Form reset after successful submission
- Graceful error handling with fallback contact information
- Defensive network error handling

## Zapier Webhook Configuration

### Webhook Setup
1. **Create Zapier Webhook Trigger**: Set up a "Catch Hook" trigger in Zapier
2. **Configure Email Action**: Connect to email service (Gmail, Outlook, etc.)
3. **Update Endpoint**: Replace placeholder URL in `assets/js/contact-form.js`

### Expected Payload Format
```json
{
  "name": "Contact Name",
  "email": "contact@example.com", 
  "message": "Message content",
  "company": ""
}
```

### Field Mapping
- **name**: Contact's name (2-200 characters)
- **email**: Contact's email address (validated format)
- **message**: Message content (10-4000 characters) 
- **company**: Honeypot field (should be empty for legitimate submissions)

### Spam Filtering in Zapier
Configure Zapier filter step to check:
- `company` field is empty (honeypot protection)
- `name`, `email`, `message` fields are present and non-empty
- Optional: Additional spam keyword filtering

## Operations Guide

### Monitoring and Troubleshooting

#### Client-Side Monitoring
- Browser developer tools show all form submission attempts
- Console logs indicate validation failures and network errors
- Network tab shows webhook requests and responses

#### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Network Error | "Unable to send message" | Check webhook URL and internet connection |
| 404 Not Found | Submission fails silently | Verify Zapier webhook URL is correct |
| CORS Issues | Browser blocks request | Zapier webhooks typically allow all origins |
| Validation Errors | Client-side error messages | Check field requirements (length, format) |
| Spam Filter | Form shows success but no email | Check Zapier filter conditions |

#### Debug Steps
1. Open browser developer tools
2. Submit form and check Network tab  
3. Verify webhook URL in contact-form.js
4. Check Zapier webhook history for requests
5. Review Zapier filter and action steps

### Testing

#### Manual Testing Checklist
- [ ] Form loads without JavaScript errors
- [ ] ARIA live region present and functioning
- [ ] Validation prevents empty submissions
- [ ] Email format validation works
- [ ] Message length validation (min/max)
- [ ] Honeypot field is hidden and functional
- [ ] Submit button state management works
- [ ] Success/error messages are accessible
- [ ] Form resets after successful submission
- [ ] Network error handling provides fallback contact

#### Automated Testing
```bash
# Run E2E tests
npm test

# Interactive testing
npm run test:open

# Validate HTML
npm run validate

# Compile SASS
npm run sass
```

#### E2E Test Coverage
- Valid form submissions
- Field validation (empty, invalid email, message length)
- Honeypot protection
- Timing protection
- Rate limiting simulation
- Network error handling
- Accessibility features (ARIA attributes, live regions)
- Multiple form support (index.html and elements.html)
- DRY_RUN mode testing

### Security Considerations

#### Current Security Posture
✅ **Strong**: Client-side validation, honeypot protection, timing checks
✅ **Simplified**: No backend credentials or server management required
✅ **Accessible**: Enhanced accessibility features with proper ARIA support
⚠️ **Monitoring**: Manual review of Zapier webhook history required

#### Recommended Monitoring
1. **Monitor Zapier webhook history** for:
   - Unusual submission patterns
   - Excessive honeypot triggers (>10 in 1 hour)
   - Network errors or failures
   - Large volumes of submissions

2. **Regular Security Reviews**:
   - Weekly review of Zapier webhook history
   - Monthly review of spam filter effectiveness
   - Quarterly update of client-side validation rules

#### Future Enhancements
- **Advanced Bot Protection**: Consider Cloudflare Turnstile or similar
- **Content Filtering**: Advanced spam detection in Zapier filters
- **Backup Notification**: Secondary email or SMS for critical failures
- **Rate Limiting**: Consider Cloudflare rate limiting for additional protection

### Webhook Security

#### Webhook URL Protection
The Zapier webhook URL should be treated as sensitive:
- **Never commit** the full webhook URL to public version control
- **Rotate webhook URLs** if compromised
- **Monitor Zapier logs** for unexpected usage patterns
- **Use HTTPS only** (Zapier enforces this by default)

## Development

### Local Development
```bash
# Start local server
npm start

# Watch SASS changes
npm run sass:watch

# Run development server with auto-reload
npm run dev
```

### Making Changes

#### Frontend Changes
1. Edit `assets/js/contact-form.js` for form behavior
2. Test with `npm run test:open`
3. Validate HTML with `npm run validate`
4. Manual testing per checklist above

#### Webhook Configuration Changes
**⚠️ IMPORTANT**: Webhook URL changes affect production immediately.

Before updating the webhook URL in `assets/js/contact-form.js`:
1. **Test new webhook**: Verify Zapier webhook receives and processes test submissions
2. **Document the change**: Record old and new webhook URLs
3. **Plan rollback**: Keep previous webhook URL available for quick revert
4. **Monitor submissions**: Watch Zapier history after deployment

## Integration Testing

### Testing Against Live Webhook
```bash
# Test webhook with valid submission
curl -i \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message from integration testing","company":""}' \
  https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_KEY
```

Expected successful response:
```json
{
  "status": "success"
}
```

### Testing Honeypot Protection
```bash
# Test with honeypot field filled (should be filtered by Zapier)
curl -i \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot User","email":"bot@example.com","message":"Spam message","company":"spam company"}' \
  https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_KEY
```

### Load Testing Considerations
- Zapier has built-in rate limiting and fair usage policies
- For load testing, coordinate with Zapier support if needed
- Test honeypot and timing protections separately
- Monitor Zapier task usage during testing

---

## Contact Information

For technical issues with the contact form:
- **Development**: Update GitHub issues in CSS-MB/mbconsult-pages
- **Operations**: Zapier webhook history and logs
- **Emergency**: Direct email to support@mbconsult.io

---

Last Updated: Contact form architecture overhauled with enhanced security, accessibility, and comprehensive E2E testing framework.