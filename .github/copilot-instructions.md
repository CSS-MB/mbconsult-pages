# MB CONSULT Business Website

MB CONSULT is a static HTML5 business website for a consulting company, featuring modern CSS3 styling, responsive design, and interactive contact functionality. The site uses SASS for CSS preprocessing and includes an Azure Functions backend for contact form submissions.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Environment Setup

- Install Node.js (any recent version) for tooling: `node --version` to verify
- Install SASS globally: `npm install -g sass` -- takes 15-30 seconds
- Install live-server for development: `npm install -g live-server` -- takes 60-90 seconds
- Install htmlhint for validation: `npm install -g htmlhint` -- takes 15-30 seconds

### Development Server Options

**Option 1: Python HTTP Server (Recommended for simple viewing)**

```bash
cd /path/to/repository
python3 -m http.server 8000
# Access at http://localhost:8000
```

**Option 2: Live-server (Recommended for development with auto-reload)**

```bash
cd /path/to/repository
live-server --port=8080 --host=localhost --no-browser
# Access at http://localhost:8080
# Automatically reloads on file changes
```

### CSS Development with SASS

- **NEVER CANCEL**: SASS compilation takes 1-2 seconds. Set timeout to 60+ seconds to be safe.
- Source files in `assets/sass/` directory
- Compiled output goes to `assets/css/main.css`
- **To compile SASS:**

```bash
cd /path/to/repository
sass assets/sass/main.scss assets/css/main.css
# Expect deprecation warnings - these are normal and safe to ignore
# Compilation completes in ~1 second
```

- **For development with auto-compilation:**

```bash
sass --watch assets/sass/main.scss:assets/css/main.css
```

### HTML Validation and Quality

```bash
cd /path/to/repository
htmlhint *.html
# Should report "no errors found" for all HTML files
# Validation completes in ~0.1 seconds
```

## Repository Structure

```
/
├── index.html              # Homepage
├── generic.html            # About page
├── elements.html           # Services & Features page
├── assets/
│   ├── css/               # Compiled CSS files
│   │   ├── main.css       # Main stylesheet (compiled from SASS)
│   │   ├── noscript.css   # No-JavaScript fallback styles
│   │   └── fontawesome-all.min.css
│   ├── sass/              # SASS source files
│   │   ├── main.scss      # Main SASS entry point
│   │   ├── libs/          # SASS libraries and mixins
│   │   ├── base/          # Base styles
│   │   ├── components/    # Component styles
│   │   └── layout/        # Layout styles
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Main site JavaScript
│   │   └── jquery.*.js    # jQuery and plugins
│   ├── webfonts/          # FontAwesome fonts
│   └── images/            # Site images
├── ContactFormHandler/     # Azure Functions backend
│   ├── function.json      # Function configuration
│   └── index.js           # Contact form handler
├── .hintrc                # Browser compatibility configuration
└── .github/
    └── ISSUE_TEMPLATE/    # GitHub issue templates
```

## Validation and Testing

### Manual Website Testing Workflow

**ALWAYS complete this full workflow after making any changes:**

1. **Start development server** (choose one option above)
2. **Open browser and navigate to site**
3. **Test navigation**: Click all menu items (Home, About, Services & Features)
4. **Test responsive design**: Resize browser window to test mobile/tablet views
5. **Test contact form functionality**:
   - Fill in Name field: "Test User"
   - Fill in Email field: "test@example.com"
   - Fill in Message field: "Test message content"
   - Verify form accepts input and fields highlight properly
   - Note: Form submission requires Azure backend - frontend validation only

### Content Validation

- **Primary pages**: index.html (Homepage), generic.html (About), elements.html (Services)
- **Key sections**: Welcome, Who We Are, What We Do, Get In Touch
- **Contact info**: Idaho Falls, ID 83406, support@mbconsult.io, (208) 254-5305
- **Expected errors**: Console may show "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT.Inspector" - this is normal and safe to ignore

### Performance and Compatibility

- Site loads in under 2 seconds on local server
- Compatible with modern browsers (see .hintrc for specific versions)
- Mobile-responsive design works on all screen sizes
- No automated testing infrastructure - manual testing required for all changes
- No package.json - this is intentional (pure static site)

## Common Tasks

### Making Style Changes

1. Edit SASS files in `assets/sass/` directory
2. Compile with: `sass assets/sass/main.scss assets/css/main.css`
3. Refresh browser to see changes (or use live-server for auto-reload)
4. **Always test**: Run full manual testing workflow above

### Making Content Changes

1. Edit HTML files directly (index.html, generic.html, elements.html)
2. Validate with: `htmlhint *.html`
3. Test in browser with development server
4. **Always test**: Run full manual testing workflow above

### Adding New Images

1. Place images in `images/` directory
2. Reference in HTML as: `src="images/filename.jpg"`
3. Update alt tags for accessibility
4. Test loading in browser

### Contact Form Modifications

- **Frontend**: Form HTML is in index.html around line 207
- **Backend**: Azure Function in ContactFormHandler/ directory
- **Endpoint**: Currently configured for Power Automate webhook
- **Testing**: Only frontend validation possible without Azure credentials

## Known Issues and Limitations

- SASS compilation produces deprecation warnings - these are safe to ignore
- Contact form requires Azure Functions backend for actual email sending
- Console errors about blocked resources are normal and expected
- No automated testing infrastructure exists
- No package.json - this is intentional (pure static site)

## Timing Expectations

- **SASS compilation**: 1-2 seconds (NEVER CANCEL - set 60+ second timeout)
- **HTML validation**: 0.1-0.2 seconds for all files
- **Development server startup**: 2-3 seconds
- **Live-server with tools install**: Initial npm installs take 60-90 seconds each
- **Full manual testing workflow**: 2-3 minutes to complete thoroughly

## Quick Reference Commands

```bash
# Start development
python3 -m http.server 8000

# Compile SASS
sass assets/sass/main.scss assets/css/main.css

# Validate HTML
htmlhint *.html

# Install dev tools (one-time setup)
npm install -g sass live-server htmlhint
```

**Remember**: This is a static website - no complex build process, no package.json, no npm scripts. Focus on HTML/CSS/JS editing and manual browser testing.
