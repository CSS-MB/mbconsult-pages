# MB CONSULT Business Website

MB CONSULT is a static HTML5 business website for a consulting company, featuring modern CSS3 styling, responsive design, and interactive contact functionality with Azure Functions backend.

## Development

This is a static website built with HTML5, CSS3, and JavaScript. See the existing `README.txt` for detailed development instructions.

## Azure Functions Deployment

The website includes an Azure Function for contact form handling located in the `ContactFormHandler/` directory.

### GitHub Actions Deployment with OIDC

The repository uses GitHub Actions for automated deployment to Azure Functions using OpenID Connect (OIDC) authentication.

#### Required Repository Secrets

To enable automated deployment, configure the following secrets in your GitHub repository:

1. **AZURE_CLIENT_ID**: The Application (client) ID of the Azure service principal
2. **AZURE_TENANT_ID**: The Directory (tenant) ID of your Azure Active Directory
3. **AZURE_SUBSCRIPTION_ID**: Your Azure subscription ID

#### Setting up Azure OIDC Federation

1. **Create or use an existing Azure Service Principal**:
   ```bash
   az ad sp create-for-rbac --name "github-actions-mbconsult" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}
   ```

2. **Configure OIDC federated credentials** in Azure Portal:
   - Navigate to Azure Active Directory > App registrations
   - Select your service principal
   - Go to Certificates & secrets > Federated credentials
   - Add a new federated credential with:
     - **Issuer**: `https://token.actions.githubusercontent.com`
     - **Subject identifier**: `repo:CSS-MB/mbconsult-pages:ref:refs/heads/main`
     - **Audience**: `api://AzureADTokenExchange`

3. **Grant permissions** to the service principal:
   - Assign "Website Contributor" role to the Function App
   - Ensure the service principal can deploy to the target resource group

#### Deployment Workflow

The deployment workflow (`deploy-functions.yml`) automatically triggers on:
- Push to main branch (when Function-related files change)
- Manual workflow dispatch

The workflow:
1. Authenticates with Azure using OIDC
2. Deploys the Function App package to `mbconsult-function-app`
3. Performs a smoke test of the deployed endpoint

## Function App Structure

- **Root package**: The Function App package is at the repository root (`.`)
- **Host configuration**: `host.json` (Azure Functions v4 compatible)
- **Functions**: Located in `ContactFormHandler/` directory
- **Dependencies**: Managed via `package.json` at repository root

## Contact Form Integration

For detailed information about the contact form implementation and Power Automate integration, see `README_CONTACT_FORM.md`.