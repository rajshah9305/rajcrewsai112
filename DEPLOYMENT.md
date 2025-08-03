# Deployment Guide

## GitHub Upload Instructions

To upload this CrewAI Dashboard code to your GitHub repository, follow these steps:

### Manual Upload Method (Recommended)

1. **Download the project files** from Replit:
   - Go to the Files panel in Replit
   - Select all files and folders
   - Download as a ZIP file

2. **Extract and prepare**:
   - Extract the ZIP file to your local machine
   - Open a terminal in the extracted folder

3. **Initialize Git and push**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CrewAI Dashboard Pro with Cerebras AI integration"
   git branch -M main
   git remote add origin https://github.com/rajshah9305/Newercrewai.git
   git push -u origin main
   ```

### Environment Variables Setup

Before deploying, make sure to set up these environment variables:

```env
CEREBRAS_API_KEY=your_cerebras_api_key_here
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### Deployment Options

#### 1. Replit Deployment
- Click the "Deploy" button in Replit
- Configure your custom domain if needed
- Ensure environment variables are set in Replit Secrets

#### 2. Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

#### 3. Railway Deployment
```bash
npm install -g @railway/cli
railway login
railway deploy
```

#### 4. Render Deployment
- Connect your GitHub repository to Render
- Set build command: `npm install && npm run build`
- Set start command: `npm start`

### Production Build

To create a production build:

```bash
npm run build
```

This will create optimized builds for both client and server.

### Database Migration

The application uses Drizzle ORM. The database schema will be automatically created when the application starts for the first time.

### Health Check

After deployment, verify the application is working:

1. Check that the dashboard loads at your domain
2. Test agent creation functionality
3. Verify Cerebras AI execution works
4. Confirm all 7 dashboard sections are accessible

### Troubleshooting

**Common Issues:**

1. **Cerebras API Key Error**: Ensure your API key is correctly set in environment variables
2. **Database Connection**: Verify your PostgreSQL connection string is correct
3. **Build Errors**: Check that all dependencies are installed with `npm install`
4. **CORS Issues**: Ensure your frontend and backend URLs are properly configured

**Performance Optimization:**

- Enable gzip compression
- Set proper cache headers
- Use a CDN for static assets
- Monitor database query performance

### Monitoring

Consider setting up monitoring for:
- API response times
- Database connection health
- Cerebras API usage and costs
- Error rates and application logs