# N8N Setup Guide for Ad Status Updates

## Overview

To fix the "pending" status issue in ad history, n8n needs to call the status update API when ad generation is completed.

## API Endpoint

**URL:** `https://your-vercel-domain.vercel.app/api/update-ad-status`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

## Request Body

```json
{
  "recordId": "uuid-of-ad-record",
  "status": "completed",
  "generatedAds": [
    {
      "url": "https://example.com/ad1.jpg",
      "description": "Generated ad description"
    }
  ]
}
```

### Status Values

- `"pending"` - Initial status when ad is submitted
- `"processing"` - Ad is being generated
- `"completed"` - Ad generation successful
- `"failed"` - Ad generation failed

## N8N Workflow Setup

### Step 1: Add HTTP Request Node

After your ad generation is complete, add an HTTP Request node:

1. **Node Type:** HTTP Request
2. **Method:** POST
3. **URL:** `https://your-vercel-domain.vercel.app/api/update-ad-status`
4. **Headers:** 
   ```
   Content-Type: application/json
   ```

### Step 2: Configure Request Body

Set the request body to:

```json
{
  "recordId": "{{ $json.recordId }}",
  "status": "completed",
  "generatedAds": "{{ $json.generatedAds }}"
}
```

### Step 3: Handle Success/Failure

Add conditional logic:

- **If successful:** Set status to "completed"
- **If failed:** Set status to "failed" and include error message

## Example N8N Workflow

```
1. Webhook (receives ad request)
2. Process images
3. Generate ads
4. Send email
5. HTTP Request (update status to "completed")
6. Handle errors (update status to "failed")
```

## Error Handling

If ad generation fails, send:

```json
{
  "recordId": "{{ $json.recordId }}",
  "status": "failed",
  "error": "Error description here"
}
```

## Testing

1. Generate an ad through your app
2. Check the ad history - should show "pending"
3. After n8n completes processing, status should update to "completed"
4. Check the ad history again - should show "completed"

## Environment Variables

Make sure your Vercel deployment has these environment variables:
- `REACT_APP_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

- Check Vercel function logs for API errors
- Verify the recordId is being passed correctly
- Ensure n8n has internet access to call the API
- Check Supabase logs for database update errors 