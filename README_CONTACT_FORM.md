# Contact Form Documentation

## Current Architecture

The MB CONSULT website contact forms submit directly to a secure Azure Function backend proxy that enforces strict validation, CORS policies, and anti-spam measures before forwarding to email services.

### Form Locations
- **Homepage** (`index.html`): "Get in Touch" section
- **Services Page** (`elements.html`): "Contact Us" section

### Technical Implementation
- **Frontend Handler**: `assets/js/contact-form.js` - Enhanced accessible form handler with ARIA live regions
- **Backend Proxy**: `ContactFormHandler/index.js` - Hardened Azure Function with strict CORS and validation
- **Method**: POST with JSON payload: `{ name, email, message }`
- **Endpoint**: `https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler`

## Enhanced Security Features

### Multi-Layer Anti-Spam Protection
1. **Honeypot Field**: Hidden "company" input field automatically added to forms
   - If filled by bots, submission is silently treated as success without sending email
   - Field is completely hidden via CSS and positioned off-screen with `aria-hidden="true"`
   
2. **Timing Validation**: Submissions under 300ms after page load are rejected
   - Client-side tracking prevents obvious scripted attacks
   - Server-side validation as additional protection
   - Rejected submissions show success message to avoid revealing the check

3. **Strict CORS Enforcement**: Backend only accepts requests from production domains
   - `https://mbconsult.io` and `https://www.mbconsult.io` by default
   - Configurable via `CORS_ORIGINS` environment variable
   - Invalid origins receive 403 Forbidden

4. **Rate Limiting**: IP-based cooldown period (60 seconds default)
5. **Input Validation**: 
   - Email format validation (client and server)
   - Message length limits (10-4000 characters)
   - Name length limits (2-200 characters)
   - Input sanitization and HTML escaping

6. **Enhanced Logging**: All validation failures, spam attempts, and errors are logged for audit

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

## Environment Variables (Azure App Settings)

| Variable | Purpose | Default / Requirement |
|----------|---------|----------------------|
| `CORS_ORIGINS` | CSV of allowed origins | `https://mbconsult.io,https://www.mbconsult.io` |
| `MAX_JSON_BYTES` | Request body max bytes | 32768 |
| `MAX_MESSAGE_LENGTH` | Max message length | 4000 |
| `MIN_MESSAGE_LENGTH` | Min message length | 10 |
| `MAX_NAME_LENGTH` | Max name length | 200 |
| `RATE_LIMIT_SECONDS` | Cooldown per IP | 60 |
| `DRY_RUN` | Simulate success (no email send) | false |
| `OFFICE365_USER` / `OFFICE365_PASS` | SMTP credentials | Required |
| `TO_EMAIL` | Recipient address | Required |
| `FROM_EMAIL` | Envelope sender | Optional (falls back to OFFICE365_USER) |
| `SUBJECT_PREFIX` | Email subject prefix | "[MB CONSULT Contact]" |

## Operations Guide

### Monitoring and Troubleshooting

#### Server-Side Monitoring
- Azure Function logs include detailed information for all events:
  - Successful submissions with processing time
  - Validation failures with specific errors
  - CORS violations with origin information
  - Honeypot triggers and timing violations
  - Rate limiting events
  - SMTP errors with categorized hints

#### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| CORS Blocked | Network error in browser console | Add domain to `CORS_ORIGINS` env var |
| 415 Error | "Content-Type must be application/json" | Check client headers |
| 400 Validation | "name is required" etc. | Check field requirements |
| 429 Rate Limited | "Too many requests" | Wait 60 seconds or adjust `RATE_LIMIT_SECONDS` |
| 500 SMTP Auth | "Failed to send (smtp-auth)" | Verify `OFFICE365_USER/PASS` credentials |
| 500 Send-As | "Failed to send (send-as)" | Check `FROM_EMAIL` permissions |

#### Debug Steps
1. Open browser developer tools
2. Submit form and check Network tab
3. Check server logs in Azure portal
4. Verify environment variables are set correctly

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
✅ **Strong**: CORS enforcement, input validation, rate limiting, honeypot, timing checks
✅ **Logging**: Comprehensive audit trail of all security events
✅ **Defense in Depth**: Multiple layers of protection
⚠️ **Monitoring**: Manual log review required (consider automated alerting)

#### Recommended Monitoring
1. **Set up Azure Function alerts** for:
   - High error rates (>5% in 5 minutes)
   - Excessive honeypot triggers (>10 in 1 hour)
   - CORS violations (>5 in 5 minutes)
   - Rate limiting events (>20 in 5 minutes)

2. **Regular Security Reviews**:
   - Weekly log review for unusual patterns
   - Monthly review of environment variables
   - Quarterly update of allowed origins list

#### Future Enhancements
- **Advanced Bot Protection**: Consider Cloudflare Turnstile or similar
- **Geographic Restrictions**: Block submissions from unexpected countries
- **Content Filtering**: Advanced spam detection in message content
- **Backup Notification**: Secondary email or SMS for critical failures

### Rotating Credentials

#### SMTP Credentials
1. Generate new Office365 app password
2. Update `OFFICE365_PASS` in Azure App Settings
3. Test with DRY_RUN=true first
4. Deploy and verify functionality
5. Revoke old credentials

#### Endpoint Security
The Azure Function URL includes authentication keys and should be treated as sensitive:
- **Never commit** the full endpoint URL to version control
- **Rotate Function keys** quarterly via Azure portal
- **Monitor access logs** for unexpected usage patterns

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

#### Backend Changes
**⚠️ IMPORTANT**: Backend changes require careful planning due to production impact.

Before modifying `ContactFormHandler/index.js`:
1. **Document the change**: Objective, scope, risks, rollback plan
2. **Test in DRY_RUN mode**: Set `DRY_RUN=true` in Azure settings
3. **Incremental deployment**: Deploy to staging first if available
4. **Monitor logs**: Watch for errors after deployment
5. **Rollback plan**: Keep previous version ready to redeploy

## Integration Testing

### Testing Against Live Backend
```bash
# Set DRY_RUN mode for safe testing
curl -i \
  -H "Origin: https://www.mbconsult.io" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message from integration testing"}' \
  https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler
```

Expected DRY_RUN response:
```json
{
  "success": true,
  "dryRun": true
}
```

### Load Testing Considerations
- Rate limiting is set to 60-second cooldowns per IP
- For load testing, coordinate with operations to temporarily adjust limits
- Use multiple source IPs to avoid triggering rate limits
- Test honeypot and timing protections separately

---

## Contact Information

For technical issues with the contact form:
- **Development**: Update GitHub issues in CSS-MB/mbconsult-pages
- **Operations**: Azure Function logs and environment variables
- **Emergency**: Direct email to support@mbconsult.io

---

Last Updated: Contact form architecture overhauled with enhanced security, accessibility, and comprehensive E2E testing framework.