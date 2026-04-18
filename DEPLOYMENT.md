# Deployment Guide (Tencent Cloud)

To deploy your ListingCraft AI project to Tencent Cloud, follow these steps:

## 1. Prepare for Production
First, you need to build the project locally or on your CI/CD pipeline:
```bash
npm run build
```
This generates the `.output` folder containing the production-ready server and assets.

## 2. Deployment Options

### Option A: Cloud Virtual Machine (CVM) / Lighthouse
1.  **Upload the Code**: Upload the `.output` folder and `package.json` to your server.
2.  **Install Node.js**: Ensure Node.js (v18+) is installed on your server.
3.  **Set Environment Variables**:
    Create a `.env` file or export variables:
    - `DEEPSEEK_API_KEY`
    - `GEMINI_API_KEY`
    - `PADDLE_ENV`
    - `PADDLE_API_KEY`
    - `PADDLE_WEBHOOK_SECRET`
    - `PADDLE_PRICE_STARTER`
    - `PADDLE_PRICE_PRO`
    - `FIREBASE_ADMIN_PROJECT_ID`
    - `FIREBASE_ADMIN_CLIENT_EMAIL`
    - `FIREBASE_ADMIN_PRIVATE_KEY`
    - `NITRO_PORT=3000`
4.  **Run the Server**:
    ```bash
    node .output/server/index.mjs
    ```
    We recommend using `pm2` to keep the process running: `pm2 start .output/server/index.mjs --name listingcraft`.

### Option B: Cloud Run / TCR (Tencent Cloud Container Registry)
1.  **Build a Docker Image**: Use a standard Node.js Dockerfile to package the `.output` directory.
2.  **Push to TCR**: Push your image to Tencent Cloud Container Registry.
3.  **Deploy to TKE/Serverless**: Use Tencent Cloud Serverless Framework or TKE to run the container.

## 3. Custom Domain & DNS
1.  **Purchase Domain**: Go to Tencent Cloud Domain Name Service to buy your domain.
2.  **DNS Resolution**: 
    - Add an `A` record pointing your domain (e.g., `listingcraft.ai`) to your CVM IP.
    - If using Serverless/Cloud Run, follow the platform instructions to bind the domain.
3.  **SSL Certificate**:
    - Apply for a free SSL certificate in Tencent Cloud SSL Certificate Service.
    - Configure Nginx or use Tencent Cloud Load Balancer (CLB) to handle HTTPS.

## 4. Firebase Configuration
Ensure your custom domain is added to the **Authorized Domains** list in the Firebase Console (Authentication > Settings > Authorized Domains). This is required for Google Login to work on your new domain.

## 5. Paddle Webhook Configuration
Create a Paddle notification destination that points to:

`https://<your-domain>/api/paddle-webhook`

Subscribe to at least:
- `transaction.paid`
- `transaction.completed`
