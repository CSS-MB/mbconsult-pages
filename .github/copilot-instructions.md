Watch mode:
```bash
sass --watch assets/sass/main.scss:assets/css/main.css
```

HTML validation:
```bash
htmlhint *.html
```

Never remove `assets/css/main.css` from version control; it is the deployable artifact.

---

## 5. Contact Form Architecture

### Frontend
- Forms located in `index.html` and `elements.html`.
- A hidden honeypot field named `company` must remain blank for real users/bots detection.
- Client script (if present or added) should:
  - Validate required fields (name, email, message).
  - Enforce minimum message length (align with backend `MIN_MESSAGE_LENGTH`).
  - POST JSON (`application/json`) to the Azure Function endpoint.
  - Provide user feedback (disable button during send, success alert, error alert).
- Endpoint (current default):
  - `https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler`
- Success UX: Alert “Message sent! Thank you for contacting MB CONSULT.”
- If honeypot triggers, backend returns success (to discourage bots enumerating detection logic).

### Backend (Azure Function)
- File: `ContactFormHandler/index.js`
- Stack: Node.js with `nodemailer` and `validator`.
- Key behaviors:
  - CORS allowlist support with fallback to default origins (`https://mbconsult.io`, `https://www.mbconsult.io`).
  - Strict `application/json` Content-Type requirement (415 otherwise).
  - JSON body size limit (32 KB default).
  - Honeypot early success (no email sent).
  - Input validation (name, email, message length).
  - IP-based cooldown rate limiting (429 on excess).
  - DRY_RUN mode for testing (simulated success).
  - Sanitization & minimal HTML escaping for email body.
  - Limited error hints (e.g., `smtp-auth`, `send-as`) without leaking raw stack traces.

### Environment Variables (MUST be set via Azure App Settings; never hardcoded)
| Variable | Purpose | Default / Requirement |
|----------|---------|-----------------------|
| `CORS_ORIGINS` | CSV of allowed origins | Defaults to preset origin list if unset |
| `MAX_JSON_BYTES` | Request body max bytes | 32768 |
| `MAX_MESSAGE_LENGTH` | Max message length | 4000 |
| `MIN_MESSAGE_LENGTH` | Min message length | 10 |
| `MAX_NAME_LENGTH` | Max name length | 200 |
| `RATE_LIMIT_SECONDS` | Cooldown per IP | 60 |
| `DRY_RUN` | Simulate success (no send) | false |
| `OFFICE365_USER` / `OFFICE365_PASS` | Preferred SMTP creds | Required (or fallback to generic SMTP vars) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Alternate SMTP config | Optional (used if Office365 not set) |
| `TO_EMAIL` | Recipient address | Required |
| `FROM_EMAIL` | Envelope sender | Optional (falls back to OFFICE365_USER) |
| `SUBJECT_PREFIX` | Email subject prefix | “[MB CONSULT Contact]” |

### Change Protocol (MANDATORY)
Before editing the Function:
1. Objective: (what problem/feature).
2. Proposed changes (code areas, new validations, env vars).
3. Dependencies (justify any new package).
4. Risks & mitigation.
5. Rollback plan (how to revert cleanly).
6. Provide this plan; await acknowledgment.

---

## 6. Accepting or Rejecting New Dependencies

Approve ONLY if ALL true:
1. A clearly stated requirement cannot be met succinctly with native code.
2. Security posture and license are acceptable (MIT/BSD/Apache; no copyleft surprises).
3. Performance impact is minimal or net-positive.
4. Maintenance burden is justified (update cadence / footprint).
5. Usage is localized (ideally Azure Function only) and well documented.

If any fail → reject.

---

## 7. Adding / Modifying Frontend Form Logic

If the repo lacks a dedicated `contact-form.js` and richer UX is required:
- Create `assets/js/contact-form.js`.
- Attach via `<script src="assets/js/contact-form.js"></script>` near end of `<body>`.
- Implement:
  - DOM selection of forms with class `contact-form`.
  - Basic validation and error messaging.
  - `fetch` POST with JSON.
  - Defensive try/catch showing user-friendly fallback error.
  - No inline script expansions in HTML.

Document addition here if material.

---

## 8. Manual Testing Checklist (Run BEFORE each PR)

1. Start local server (python or live-server).
2. Load `index.html` and `elements.html`.
3. Visual scan: layout, header, footer intact; no missing assets.
4. Responsive: narrow (<=375px), tablet (~768px), desktop (>1024px).
5. Accessibility spot check:
   - Tab through interactive elements (focus visible, logical order).
   - Images: alt attributes appropriate (decorative images can have empty alt).
6. Forms:
   - Submit empty -> client validation triggers.
   - Valid sample: Name “Test User”, Email “test@example.com”, Message meeting min length (>=10 chars).
   - Confirm submit button disable/enable cycle.
   - Honeypot remains blank.
7. Console: no uncaught errors or network CORS failures (expect none locally if endpoint reachable).
8. SASS compile: successful; only benign warnings.
9. HTML validation: `htmlhint *.html` -> 0 errors.
10. Performance sanity: quick load; no enormous assets added.
11. (If DRY_RUN active) Confirm JSON response includes `"dryRun": true` when curl testing backend.

---

## 9. Performance & Asset Guidelines

- Keep total added image weight per PR minimal; compress (JPEG/PNG/WebP).
- Avoid inlining large Base64 images in HTML or CSS.
- No third-party script unless absolutely necessary (plan-first).
- Font usage restricted to already included FontAwesome & system fonts.

---

## 10. SEO & Metadata Essentials

- Each HTML page: unique `<title>` + descriptive `<meta name="description">`.
- Use semantic elements (`header`, `nav`, `section`, `footer`).
- Avoid duplicate large text blocks across pages unless intentional.
- Heading levels should not skip (h1 → h2 → h3).

---

## 11. Troubleshooting Matrix

| Symptom | Probable Cause | Action |
|---------|----------------|--------|
| 415 Unsupported Media Type | Missing/incorrect `Content-Type` header | Ensure `application/json` |
| 400 Invalid or missing JSON | Malformed JSON / size exceeded | Validate payload & size |
| 400 validation errors | Empty name/email/message or short message | Adjust inputs; meet min length |
| 429 Too many requests | Rate limit hit | Wait `RATE_LIMIT_SECONDS` |
| 200 success but email not received | Honeypot triggered or DRY_RUN | Ensure honeypot empty; check DRY_RUN |
| 500 Failed to send (hint smtp-auth) | Bad SMTP credentials | Verify `OFFICE365_USER/PASS` |
| 500 Failed to send (hint send-as) | From address not authorized | Align `FROM_EMAIL` or grant send-as |
| CORS blocked | Origin not in allowlist | Add to `CORS_ORIGINS` env var |
| Hang / slow send | SMTP connectivity or network latency | Check Azure logs; verify SMTP port/security |

---

## 12. Decision Tree (Copilot Agent)

Request Type → Action:

| User Intent | Copilot Response |
|-------------|------------------|
| “Change styling / layout” | Edit SASS → compile → run checklist → propose PR. |
| “Add a field to contact form” | Plan backend + env changes → await acknowledgment → implement front + back. |
| “Switch to React / add bundler” | Out-of-Scope → produce scoped proposal, await approval. |
| “Add analytics” | Provide privacy/performance plan (async, minimal) → await approval. |
| “Optimize performance” | Audit images & request waterfall → propose targeted changes. |
| “Why 415 error?” | Reference Troubleshooting Matrix → adjust headers/payload. |
| “Add localization/i18n” | Out-of-Scope → propose rationale & minimal approach; await approval. |
| “Implement CAPTCHA” | Plan-first (choose approach: honeypot reinforcement, reCAPTCHA, hCaptcha) with env var impact. |

---

## 13. Non-Negotiables

- No secrets or credentials in repo.
- No framework / bundler drift.
- Always pass manual testing before PR.
- Always plan-first for backend changes.
- Keep documentation synchronized with reality.

---

## 14. Timing Expectations

| Task | Typical Duration |
|------|------------------|
| SASS one-off compile | ~1–2 s |
| HTML validation | ~0.1–0.2 s |
| Dev server start | ~2–3 s |
| First-time global tool install | 15–90 s each |
| Full manual test cycle | ~2–3 min |

Do NOT abort SASS compile early; allow warnings to resolve.

---

## 15. Future Extension Protocol

If expansion (CI, analytics, additional Functions) is approved:
1. Add subsection here: “Extension: <Name>”.
2. Document purpose, new files, env vars, operational impact, rollback.
3. Only then implement code.

---

## 16. Appendix A: Core Commands

```bash
# Simple server
python3 -m http.server 8000

# Auto-reload server
live-server --port=8080 --host=localhost --no-browser

# Compile SASS
sass assets/sass/main.scss assets/css/main.css

# Watch SASS
sass --watch assets/sass/main.scss:assets/css/main.css

# Validate HTML
htmlhint *.html

# Backend curl test
curl -i \
  -H "Origin: https://www.mbconsult.io" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from curl"}' \
  https://mbconsult-function-app.azurewebsites.net/api/ContactFormHandler
```

---

## 17. Appendix B: Rationale for Minimalism

Reducing moving parts:
- Lowers attack surface (no dependency chain for bundlers/transpilers).
- Simplifies audits & onboarding.
- Ensures predictable deterministic deployments.
- Minimizes maintenance churn and regressions.

Complexity is accretive cost—only introduce layers when the business case outweighs that cost.

---

Last Updated: (Update this line whenever substantive changes are made)
