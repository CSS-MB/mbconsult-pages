# Copilot Coding Agent Instructions

## Overview

This repository is configured for use with GitHub Copilot Coding Agent. This repository is for a configured and published static webpage hosted using GitHub Pages. The following instructions and best practices are provided to ensure the agent works effectively and safely in this codebase.

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
   - Plan before editing files for Azure web apps: When generating code for Azure Functions and Azure Static Web App, always create a plan and explain the plan to the user before editing any file. Proceed with editing the files after getting consent from the user.

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

   - Summarize topic before taking action: When the user asks for something about Azure, invoke the azure_development-summarize_topic tool once to discover potential recommended configurations.
   - Leave clear commit messages and comments explaining non-obvious changes.

9. **Tools:**
   - Use Azure Tools: When handling requests related to Azure, always use your tools.
   - Use Azure Code Gen Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `bestpractices` tool if available. Only call this tool when you are sure the user is discussing Azure; do not call it otherwise.
   - Use Azure Deployment Best Practices: When deploying to Azure or preparing applications for deployment to Azure, invoke your `bestpractices` tool if available. Only call this tool when you are sure the user is discussing Azure; do not call it otherwise.
   - Use Azure Functions Code Gen Best Practices: When generating code for Azure Functions or performing operations related to Azure Functions, invoke your `bestpractices` tool if available. Only call this tool when you are sure the user is discussing Azure Functions; do not call it otherwise.
   - Use Azure Functions Deployment Best Practices: When deploying Azure Functions apps to Azure or preparing for the deployment, invoke your `bestpractices` tool if available. Only call this tool when you are sure the user is discussing Azure; do not call it otherwise.
   - Use Azure SWA Best Practices: When working with static web apps, invoke your `bestpractices` tool if available. Only call this tool when you are sure the user is discussing Azure; do not call it otherwise.

## Repository-Specific Notes

- This repository contains static HTML, CSS, JS, and a `ContactFormHandler` directory for backend logic.
- Use semantic HTML and accessible design practices.
- For styling, prefer editing SCSS files in `assets/sass/` and compile to CSS.
- For JavaScript, use unobtrusive scripting and avoid inline JS in HTML files.
