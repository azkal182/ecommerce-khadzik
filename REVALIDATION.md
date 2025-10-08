# On-Demand Revalidation System

This document explains the on-demand revalidation system implemented for the Dual Store SSG pages.

## Overview

Since converting to Static Site Generation (SSG), the application uses on-demand revalidation to update static pages when data changes. This ensures that content stays fresh while maintaining the performance benefits of SSG.

## How It Works

When you make changes through the dashboard (create/update/delete products, stores, or categories), the system automatically revalidates the affected SSG pages:

### Product Changes
- **Create/Update/Delete**: Revalidates product page, store page, stores list, and home page
- **Slug Changes**: Revalidates both old and new URLs
- **Store Changes**: Revalidates both old and new store pages if product moves between stores

### Store Changes
- **Create/Update/Delete**: Revalidates store page, stores list, and home page
- **Slug Changes**: Revalidates both old and new URLs

### Category Changes
- **Create/Update/Delete**: Revalidates ALL pages since categories can appear anywhere

## Manual Revalidation

You can manually trigger revalidation using the API endpoint:

```bash
# Revalidate all pages
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'

# Revalidate specific paths
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"paths": ["/stores", "/"]}'
```

## Testing the System

Run the test script to verify revalidation is working:

```bash
node test-revalidation.js
```

## Implementation Details

### API Endpoints with Revalidation

- **Products**: `/api/dashboard/products` and `/api/dashboard/products/[id]`
- **Stores**: `/api/dashboard/stores` and `/api/dashboard/stores/[id]`
- **Categories**: `/api/dashboard/categories`

### Helper Functions

The system uses the `revalidatePages` function from `/src/lib/revalidation.ts` to handle different types of revalidation scenarios.

### Error Handling

Revalidation errors are logged but don't fail the API requests. The system continues to function even if revalidation fails temporarily.

## Benefits

1. **Performance**: SSG pages load instantly
2. **Fresh Content**: Updates appear immediately after changes
3. **SEO Friendly**: Static pages are optimized for search engines
4. **Scalability**: Reduces server load compared to SSR

## Troubleshooting

### If pages don't update after changes:

1. Check the server console for revalidation errors
2. Verify the API request was successful
3. Try manual revalidation using the API endpoint
4. Check that the pages are actually SSG (not dynamically rendered)

### Common Issues

- **Missing revalidation**: Ensure all data-changing operations call the revalidation helper
- **Wrong paths**: Verify the paths being revalidated match the actual SSG routes
- **Permissions**: Make sure the API endpoints have proper authentication

## Future Enhancements

1. **Selective Revalidation**: Only revalidate pages that actually changed
2. **Scheduled Revalidation**: Automatically revalidate pages on a schedule
3. **Cache Headers**: Add proper cache headers for CDN integration
4. **Webhooks**: Allow external systems to trigger revalidation