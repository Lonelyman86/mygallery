# How to Create GitHub Token for Galeriku

Because we are using GitHub as our "Database", the application needs permission to write files to your repository.

## 1. Create Token

1. Go to **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
   - [Direct Link](https://github.com/settings/tokens/new)
2. Note: "Generate new token (classic)".
3. **Note**: "Galeriku Upload".
4. **Expiration**: "No expiration" (or as desired).
5. **Scopes**: Check the box for **`repo`** (Full control of private repositories).
6. Click **Generate token**.
7. **COPY THE TOKEN** immediately (starts with `ghp_`).

## 2. Configure Local (.env.local)

Create a file named `.env.local` in the project root:

```env
GITHUB_TOKEN=ghp_YOUR_COPIED_TOKEN_HERE
GITHUB_OWNER=YourGitHubUsername
GITHUB_REPO=Galeriku
```

## 3. Configure Netlify (Production)

1. Go to your site dashboard on Netlify.
2. Go to **Site configuration** > **Environment variables**.
3. Add the same variables:
   - Key: `GITHUB_TOKEN`, Value: `ghp_...`
   - Key: `GITHUB_OWNER`, Value: `YourGitHubUsername`
   - Key: `GITHUB_REPO`, Value: `Galeriku`

## 4. Enable Netlify Identity

1. Go to **Site configuration** > **Identity**.
2. Click **Enable Identity**.
3. (Optional) Set Registration preferences to "Open".
4. (Optional) Put "External providers" like Google if you want one-click login.

Now your app can Login users via Netlify and Save photos via GitHub!
