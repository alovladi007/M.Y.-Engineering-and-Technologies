# Render Deployment Guide for LUMA IP

## Overview
This guide will help you deploy LUMA IP on Render using the Blueprint configuration.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub at `alovladi007/Patent-Filing-Platform-Builder`
2. **Render Account**: Sign up for a free account at [render.com](https://render.com)
3. **Required API Keys**: Prepare the following credentials:
   - Stripe API keys (for payment processing)
   - AWS S3 credentials (for document storage)
   - OpenAI/Anthropic API keys (for AI features)
   - SMTP credentials (for email notifications)

## Deployment Steps

### Step 1: Push render.yaml to GitHub

```bash
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create Blueprint on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository `alovladi007/Patent-Filing-Platform-Builder`
4. Select the `main` branch
5. Name your Blueprint: "Patent / IP automated website"
6. Click **"Apply"**

### Step 3: Configure Environment Variables

After the Blueprint is created, you'll need to set the following environment variables in the Render Dashboard:

#### For the API Service (patent-api):

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | `whsec_...` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | `sk-ant-...` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password or app password | `...` |

#### For the Web Service (patent-web):

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics ID (optional) | `G-...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking (optional) | `https://...@sentry.io/...` |

### Step 4: Set Up External Services

#### AWS S3 Bucket
1. Create an S3 bucket named `patent-documents`
2. Configure CORS for the bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://your-app.onrender.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

#### Stripe Webhook
1. After deployment, get your API URL from Render
2. In Stripe Dashboard, create a webhook endpoint:
   - URL: `https://patent-api-xxx.onrender.com/webhooks/stripe`
   - Events: Select payment and subscription events

### Step 5: Database Migration

The database migration will run automatically on first deployment. If you need to run migrations manually:

1. Go to your API service in Render Dashboard
2. Click **"Shell"** tab
3. Run:
```bash
cd patent-platform/apps/api
npx prisma migrate deploy --schema=../../infra/prisma/schema.prisma
```

### Step 6: Verify Deployment

1. **Check Service Status**: All services should show "Live" in the Render Dashboard
2. **Test Frontend**: Visit `https://patent-web-xxx.onrender.com`
3. **Test API**: Visit `https://patent-api-xxx.onrender.com/api/health`
4. **Check Logs**: Review logs for any errors in the Render Dashboard

## Upgrading Plans for Production

The current configuration uses free tier services. For production, upgrade to:

1. **Database**: Change from `free` to `starter` or `standard`
2. **Redis**: Change from `free` to `starter` 
3. **Web Services**: Change from `free` to `starter` or `standard`

Edit the `render.yaml` file and change the `plan` values:
```yaml
plan: starter  # or standard for production
```

## Troubleshooting

### Common Issues

1. **"No render.yaml found"**: Ensure the file is committed and pushed to the main branch
2. **Build failures**: Check that Node.js version matches (>=20.0.0)
3. **Database connection errors**: Verify DATABASE_URL is properly set
4. **CORS errors**: Update CORS_ORIGIN environment variable with your frontend URL

### Monitoring

1. **Logs**: Check service logs in Render Dashboard
2. **Metrics**: Monitor CPU, memory, and response times
3. **Alerts**: Set up health check alerts in Render

## Custom Domain Setup

1. Go to your web service settings in Render
2. Add your custom domain
3. Configure DNS records as instructed by Render
4. Enable auto-renewing SSL certificate

## Backup Strategy

1. **Database Backups**: Enable automatic backups in Render Dashboard
2. **Code**: Keep your GitHub repository up to date
3. **Environment Variables**: Document all environment variables securely

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Platform Issues: Create an issue on GitHub

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domain
4. Enable automatic deployments from GitHub
5. Set up staging environment for testing