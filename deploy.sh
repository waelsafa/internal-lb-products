#!/bin/bash

# Production Deployment Script for Internal LB Products

echo "🚀 Preparing for production deployment..."

# Switch to production configuration
echo "📝 Switching to production configuration..."
cp config.prod.yml config.yml
cp config.prod.yml admin/config.yml

echo "✅ Production configuration applied"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Deploy to Netlify (manual or via Git integration)"
echo "3. Enable Netlify Identity and Git Gateway"
echo "4. Invite content editors"
echo ""
echo "🔗 Useful commands:"
echo "  - Test locally: npm run dev:server"
echo "  - Deploy with Netlify CLI: netlify deploy --prod --dir=."
echo "  - Switch back to dev: npm run dev:local"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
