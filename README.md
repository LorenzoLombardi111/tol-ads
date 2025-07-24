# TOL Ads Generator

A React application for generating ads using AI, with user authentication and credit management.

## Features

- User authentication with Supabase
- Automatic credit assignment for new users (2 credits)
- Ad generation with AI
- Credit management system
- Secure payment processing with Stripe

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the SQL scripts in Supabase for database setup
5. Start the development server: `npm start`

## Database Setup

Run the following SQL scripts in your Supabase SQL Editor:
- `simple-trigger-fix.sql` - Sets up automatic credit assignment
- `verify-trigger.sql` - Verifies the trigger is working

## Latest Update

- Fixed sign up functionality
- Implemented secure automatic credit assignment
- Added comprehensive debugging scripts
- Enhanced error handling

## Deployment

The app is automatically deployed to Vercel on push to main branch.
