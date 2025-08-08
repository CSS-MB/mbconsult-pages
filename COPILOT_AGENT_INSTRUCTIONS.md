# Copilot Coding Agent Instructions

## Overview
This repository is configured for use with GitHub Copilot Coding Agent. The following instructions and best practices are provided to ensure the agent works effectively and safely in this codebase.

## Coding Agent Best Practices

1. **Respect Project Conventions:**
   - Follow the existing code style, naming conventions, and folder structure.
   - Use the same indentation, comment style, and file organization as the rest of the project.

2. **Testing and Validation:**
   - If the repository contains tests, run them after making changes.
   - If no tests exist, validate changes by manual inspection or by running the application if possible.

3. **Documentation:**
   - Update or create documentation (README, inline comments, etc.) when adding new features or making significant changes.
   - Document any new scripts, endpoints, or configuration files.

4. **Security and Privacy:**
   - Do not commit secrets, credentials, or sensitive data.
   - Follow security best practices for the language and framework in use.

5. **Pull Request Etiquette:**
   - Summarize all changes clearly in pull request descriptions.
   - Reference related issues or discussions when relevant.

6. **Dependency Management:**
   - Use existing package managers and lockfiles (e.g., package.json, requirements.txt) for dependencies.
   - Avoid introducing unnecessary dependencies.

7. **File and Directory Structure:**
   - Place new files in appropriate directories according to project conventions.
   - Do not create top-level files or folders unless necessary.

8. **Communication:**
   - Leave clear commit messages and comments explaining non-obvious changes.

## Repository-Specific Notes
- This repository contains static HTML, CSS, JS, and a `ContactFormHandler` directory for backend logic.
- Use semantic HTML and accessible design practices.
- For styling, prefer editing SCSS files in `assets/sass/` and compile to CSS.
- For JavaScript, use unobtrusive scripting and avoid inline JS in HTML files.

---

_This file was generated to onboard GitHub Copilot Coding Agent as per [Best practices for Copilot coding agent in your repository](https://gh.io/copilot-coding-agent-tips)._
