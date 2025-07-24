# Setup Instructions for TOL Ads Generator

## Fixing the Sign Up Issue

The sign up functionality is not working because the required environment variables are missing. Follow these steps to fix it:

### Step 1: Create Environment File

1. In the `n8n-ad-generator` directory, create a new file called `.env.local`
2. Copy the contents from `env-template.txt` into `.env.local`

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select your existing project
3. Go to Settings → API
4. Copy the following values:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

### Step 3: Update .env.local

Replace the placeholder values in `.env.local` with your actual credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Step 4: Set Up Database (Optional)

If you want the full functionality including credits and payments:

1. Go to your Supabase project SQL editor
2. Run the SQL from `supabase-setup.sql` to create the required tables
3. Run `node test-database.js` to verify the setup

### Step 5: Restart the Application

1. Stop the development server (Ctrl+C)
2. Run `npm start` again
3. The sign up should now work!

## Troubleshooting

- **"Configuration error"**: Check that your `.env.local` file exists and has the correct values
- **"Network error"**: Check your internet connection
- **"Invalid API key"**: Verify your Supabase credentials are correct
- **Console errors**: Check the browser console for detailed error messages

## Additional Configuration (Optional)

For full functionality, you'll also need:
- Stripe account for payments
- N8N instance for ad generation

These are optional and the sign up will work without them. 