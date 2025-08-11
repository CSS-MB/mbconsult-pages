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

10. **Code Quality:**

- Ensure code is clean, readable, and maintainable.
- Avoid unnecessary complexity; keep solutions simple and straightforward.

11. **Version Control:**

- Commit changes frequently with clear messages.
- Use branches for new features or significant changes.
- Avoid committing large files or binaries unless necessary.

12. **Error Handling:**

- Implement proper error handling and logging where applicable.
- Ensure that error messages are user-friendly and do not expose sensitive information.

13. **Performance Considerations:**

- Optimize code for performance where applicable.
- Avoid premature optimization; focus on clarity first, then optimize as needed.

14. **Accessibility:**

- Ensure that any web content is accessible to users with disabilities.
- Follow best practices for web accessibility (e.g., WCAG guidelines).

15. **Cross-Browser Compatibility:**

- Test web applications in multiple browsers to ensure compatibility.

16. **Mobile Responsiveness:**

- Ensure that web applications are responsive and work well on various screen sizes and devices.

17. **Static Site Considerations:**

- For static sites, ensure that all assets (CSS, JS, images) are correctly linked and optimized.
- Use appropriate caching strategies for static assets to improve load times.

18. **SEO Best Practices:**

- Use semantic HTML and appropriate meta tags to improve search engine visibility.
- Ensure that the site is crawlable by search engines.

19. **Content Management:**

- If the repository includes content (e.g., blog posts, documentation), ensure that it is well-organized and easy to navigate.
- Use a consistent format for content files (e.g., Markdown, HTML).

20. **Static Site Deployment:**

- Ensure that the static site is built correctly before deployment.
- Use appropriate tools for deploying static sites (e.g., GitHub Pages, Netlify).
- Verify that all links and resources are correctly referenced after deployment.
- Monitor the deployed site for any issues or errors post-deployment.

21. **Static Site Security:**

- Ensure that the static site does not expose sensitive information.
- Use HTTPS for secure connections.

22. **Static Site Performance:**

- Optimize images and other assets to reduce load times.
- Use techniques like lazy loading for images and scripts to improve performance.

23. **Static Site Analytics:**

- If using analytics, ensure that tracking scripts are correctly implemented and do not interfere with site performance.
- Respect user privacy and comply with relevant regulations (e.g., GDPR, CCPA).

24. **Static Site Maintenance:**

- Regularly update dependencies and libraries used in the static site.
- Monitor for security vulnerabilities in dependencies and address them promptly.

25. **Static Site Backup:**

- Regularly back up the static site content and configuration.
- Use version control to track changes and maintain a history of the site.

26. **Static Site Collaboration:**

- Use pull requests for code reviews and collaboration.
- Encourage contributions from other developers and maintainers.

## Repository-Specific Notes

- This repository contains static HTML, CSS, JS, and a `ContactFormHandler` directory for backend logic.
- Use semantic HTML and accessible design practices.
- For styling, prefer editing SCSS files in `assets/sass/` and compile to CSS.
- For JavaScript, use unobtrusive scripting and avoid inline JS in HTML files.
- Ensure that any changes to the `ContactFormHandler` logic are well-documented and tested.
- When making changes to the `ContactFormHandler`, ensure that the logic is secure and does not expose sensitive information.
- If adding new features, consider how they will affect the existing static site and ensure compatibility.
- When deploying changes, ensure that the static site is built correctly and that all assets are included in the deployment.
- If the repository uses GitHub Actions for CI/CD, ensure that workflows are updated to reflect any changes made to the codebase.
- If the repository uses GitHub Pages, ensure that the `gh-pages` branch is updated with the latest changes after deployment.
- If the repository uses a custom domain for GitHub Pages, ensure that the DNS settings are correctly configured and that the custom domain is set up in the repository settings.
- If the repository uses a specific build tool (e.g., Webpack, Gulp), ensure that any new dependencies or configurations are compatible with the existing setup.
- If the repository uses a specific framework (e.g., React, Vue), ensure that any new components or features are compatible with the existing framework setup.
- If the repository uses a specific testing framework (e.g., Jest, Mocha), ensure that any new tests are written in accordance with the existing testing practices.
- If the repository uses a specific deployment strategy (e.g., manual, automated), ensure that any new features or changes are compatible with the existing deployment process.
- If the repository uses a specific version control strategy (e.g., branching, tagging), ensure that any new features or changes are compatible with the existing version control practices.
- If the repository uses a specific code review process (e.g., pull requests, code reviews), ensure that any new features or changes are submitted for review in accordance with the existing process.
- If the repository uses a specific issue tracking system (e.g., GitHub Issues, Jira), ensure that any new features or changes are documented in the issue tracker.
- If the repository uses a specific project management tool (e.g., GitHub Projects, Trello), ensure that any new features or changes are documented in the project management tool.
- If the repository uses a specific communication tool (e.g., Slack, Discord), ensure that any new features or changes are communicated in the appropriate channels.
- If the repository uses a specific coding standard (e.g., Airbnb, Google), ensure that any new features or changes adhere to the coding standard.
- If the repository uses a specific code formatting tool (e.g., Prettier, ESLint), ensure that any new features or changes are formatted according to the code formatting tool.
- If the repository uses a specific code linting tool (e.g., ESLint, TSLint), ensure that any new features or changes are linted according to the code linting tool.
- If the repository uses a specific code analysis tool (e.g., SonarQube, CodeClimate), ensure that any new features or changes are analyzed according to the code analysis tool.
- If the repository uses a specific code quality tool (e.g., Codecov, Coveralls), ensure that any new features or changes are tested according to the code quality tool.
- If the repository uses a specific code coverage tool (e.g., Istanbul, NYC), ensure that any new features or changes are covered according to the code coverage tool.
- If the repository uses a specific code review tool (e.g., Reviewable, Crucible), ensure that any new features or changes are reviewed according to the code review tool.
- If the repository uses a specific code collaboration tool (e.g., GitHub, GitLab), ensure that any new features or changes are collaborated on according to the code collaboration tool.
- If the repository uses a specific code deployment tool (e.g., Jenkins, CircleCI), ensure that any new features or changes are deployed according to the code deployment tool.
- If the repository uses a specific code monitoring tool (e.g., New Relic, Datadog), ensure that any new features or changes are monitored according to the code monitoring tool.
- If the repository uses a specific code logging tool (e.g., Loggly, Splunk), ensure that any new features or changes are logged according to the code logging tool.
- If the repository uses a specific code alerting tool (e.g., PagerDuty, Opsgenie), ensure that any new features or changes are alerted according to the code alerting tool.
- If the repository uses a specific code notification tool (e.g., Slack, Discord), ensure that any new features or changes are notified according to the code notification tool.
- If the repository uses a specific code documentation tool (e.g., JSDoc, Sphinx), ensure that any new features or changes are documented according to the code documentation tool.
- If the repository uses a specific code visualization tool (e.g., D3.js, Chart.js), ensure that any new features or changes are visualized according to the code visualization tool.
- If the repository uses a specific code analytics tool (e.g., Google Analytics, Mixpanel), ensure that any new features or changes are analyzed according to the code analytics tool.
- If the repository uses a specific code performance tool (e.g., Lighthouse, WebPageTest), ensure that any new features or changes are tested for performance according to the code performance tool.
- If the repository uses a specific code accessibility tool (e.g., Axe, Lighthouse), ensure that any new features or changes are tested for accessibility according to the code accessibility tool.
- If the repository uses a specific code internationalization tool (e.g., i18next, react-intl), ensure that any new features or changes are internationalized according to the code internationalization tool.
- If the repository uses a specific code localization tool (e.g., react-i18next, vue-i18n), ensure that any new features or changes are localized according to the code localization tool.
- If the repository uses a specific code testing tool (e.g., Jest, Mocha), ensure that any new features or changes are tested according to the code testing tool.
- If the repository uses a specific code debugging tool (e.g., Chrome DevTools, Firefox Developer Edition), ensure that any new features or changes are debugged according to the code debugging tool.
- If the repository uses a specific code profiling tool (e.g., Chrome DevTools, Firefox Developer Edition), ensure that any new features or changes are profiled according to the code profiling tool.
- If the repository uses a specific code optimization tool (e.g., Webpack, Gulp), ensure that any new features or changes are optimized according to the code optimization tool.
- If the repository uses a specific code bundling tool (e.g., Webpack, Rollup), ensure that any new features or changes are bundled according to the code bundling tool.
- If the repository uses a specific code minification tool (e.g., UglifyJS, Terser), ensure that any new features or changes are minified according to the code minification tool.
- If the repository uses a specific code transpilation tool (e.g., Babel, TypeScript), ensure that any new features or changes are transpiled according to the code transpilation tool.
- If the repository uses a specific code polyfilling tool (e.g., Babel, Polyfill.io), ensure that any new features or changes are polyfilled according to the code polyfilling tool.
- If the repository uses a specific code bundling tool (e.g., Webpack, Rollup), ensure that any new features or changes are bundled according to the code bundling tool.
- If the repository uses a specific code splitting tool (e.g., Webpack, Rollup), ensure that any new features or changes are split according to the code splitting tool.
- If the repository uses a specific code tree shaking tool (e.g, Webpack, Rollup), ensure that any new features or changes are tree-shaken according to the code tree shaking tool.
- If the repository uses a specific code caching tool (e.g., Service Worker, Cache API), ensure that any new features or changes are cached according to the code caching tool.
- If the repository uses a specific code service worker tool (e.g., Workbox, Service Worker API), ensure that any new features or changes are implemented according to the code service worker tool.
- If the repository uses a specific code progressive web app tool (e.g., Workbox, Lighthouse), ensure that any new features or changes are implemented according to the code progressive web app tool.
- If the repository uses a specific code static site generator (e.g., Jekyll, Hugo), ensure that any new features or changes are implemented according to the code static site generator.
- If the repository uses a specific code content management system (e.g., WordPress, Contentful), ensure that any new features or changes are implemented according to the code content management system.
- If the repository uses a specific code headless CMS (e.g., Strapi, Sanity), ensure that any new features or changes are implemented according to the code headless CMS.
- If the repository uses a specific code e-commerce platform (e.g., Shopify, WooCommerce), ensure that any new features or changes are implemented according to the code e-commerce platform.
- If the repository uses a specific code payment gateway (e.g., Stripe, PayPal), ensure that any new features or changes are implemented according to the code payment gateway.
- If the repository uses a specific code authentication system (e.g., Auth0, Firebase Authentication), ensure that any new features or changes are implemented according to the code authentication system.
- If the repository uses a specific code authorization system (e.g., OAuth, OpenID Connect), ensure that any new features or changes are implemented according to the code authorization system.
- If the repository uses a specific code user management system (e.g., Firebase, Auth0), ensure that any new features or changes are implemented according to the code user management system.
- If the repository uses a specific code role management system (e.g., Firebase, Auth0), ensure that any new features or changes are implemented according to the code role management system.
- If the repository uses a specific code permission management system (e.g., Firebase, Auth0), ensure that any new features or changes are implemented according to the code permission management system.
- If the repository uses a specific code session management system (e.g., Firebase, Auth0), ensure that any new features or changes are implemented according to the code session management system.
- If the repository uses a specific code token management system (e.g., Firebase, Auth0), ensure that any new features or changes are implemented according to the code token management system.
- If the repository uses a specific code API management system (e.g., Apigee, AWS API Gateway), ensure that any new features or changes are implemented according to the code API management system.
- If the repository uses a specific code microservices architecture (e.g., Spring Boot, Node.js), ensure that any new features or changes are implemented according to the code microservices architecture.
- If the repository uses a specific code serverless architecture (e.g., AWS Lambda, Azure Functions), ensure that any new features or changes are implemented according to the code serverless architecture.
- If the repository uses a specific code containerization tool (e.g., Docker, Kubernetes), ensure that any new features or changes are implemented according to the code containerization tool.
- If the repository uses a specific code orchestration tool (e.g., Kubernetes, Docker Swarm), ensure that any new features or changes are implemented according to the code orchestration tool.
- If the repository uses a specific code continuous integration tool (e.g., Jenkins, Travis CI), ensure that any new features or changes are implemented according to the code continuous integration tool.
- If the repository uses a specific code continuous deployment tool (e.g., Jenkins, CircleCI), ensure that any new features or changes are implemented according to the code continuous deployment tool.
- If the repository uses a specific code continuous delivery tool (e.g., Jenkins, CircleCI), ensure that any new features or changes are implemented according to the code continuous delivery tool.
- If the repository uses a specific code version control system (e.g., Git, Mercurial), ensure that any new features or changes are implemented according to the code version control system.
- If the repository uses a specific code branching strategy (e.g., Git Flow, GitHub Flow), ensure that any new features or changes are implemented according to the code branching strategy.
- If the repository uses a specific code merging strategy (e.g., Squash and Merge, Rebase and Merge), ensure that any new features or changes are implemented according to the code merging strategy.
- If the repository uses a specific code pull request strategy (e.g., Draft Pull Requests, Reviewable Pull Requests), ensure that any new features or changes are implemented according to the code pull request strategy.
- If the repository uses a specific code issue tracking system (e.g., GitHub Issues, Jira), ensure that any new features or changes are implemented according to the code issue tracking system.
- If the repository uses a specific code project management system (e.g., GitHub Projects, Trello), ensure that any new features or changes are implemented according to the code project management system.
- If the repository uses a specific code communication system (e.g., Slack, Discord), ensure that any new features or changes are communicated according to the code communication system.
- If the repository uses a specific code collaboration system (e.g., GitHub, GitLab), ensure that any new features or changes are collaborated on according to the code collaboration system.
- If the repository uses a specific code documentation system (e.g., GitHub Wiki, Confluence), ensure that any new features or changes are documented according to the code documentation system.
- If the repository uses a specific code visualization system (e.g., D3.js, Chart.js), ensure that any new features or changes are visualized according to the code visualization system.
- If the repository uses a specific code analytics system (e.g., Google Analytics, Mixpanel), ensure that any new features or changes are analyzed according to the code analytics system.
- If the repository uses a specific code performance system (e.g., Lighthouse, WebPageTest), ensure that any new features or changes are tested for performance according to the code performance system.
- If the repository uses a specific code accessibility system (e.g., Axe, Lighthouse), ensure that any new features or changes are tested for accessibility according to the code accessibility system.
- If the repository uses a specific code internationalization system (e.g., i18next, react-intl), ensure that any new features or changes are internationalized according to the code internationalization system.
- If the repository uses a specific code localization system (e.g., react-i18next, vue-i18n), ensure that any new features or changes are localized according to the code localization system.
- If the repository uses a specific code testing system (e.g., Jest, Mocha), ensure that any new features or changes are tested according to the code testing system.
- If the repository uses a specific code debugging system (e.g., Chrome DevTools, Firefox Developer Edition), ensure that any new features or changes are debugged according to the code debugging system.
- If the repository uses a specific code profiling system (e.g., Chrome DevTools, Firefox Developer Edition), ensure that any new features or changes are profiled according to the code profiling system.
- If the repository uses a specific code optimization system (e.g., Webpack, Gulp), ensure that any new features or changes are optimized according to the code optimization system.
- If the repository uses a specific code bundling system (e.g., Webpack, Rollup), ensure that any new features or changes are bundled according to the code bundling system.
- If the repository uses a specific code minification system (e.g., UglifyJS, Terser), ensure that any new features or changes are minified according to the code minification system.
- If the repository uses a specific code transpilation system (e.g., Babel, TypeScript), ensure that any new features or changes are transpiled according to the code transpilation system.
- If the repository uses a specific code polyfilling system (e.g., Babel, Polyfill.io), ensure that any new features or changes are polyfilled according to the code polyfilling system.
- If the repository uses a specific code bundling system (e.g., Webpack, Rollup), ensure that any new features or changes are bundled according to the code bundling system.
