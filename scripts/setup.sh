#!/bin/bash

echo "Setting up Personal Finance Management App..."
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Setting up database..."
npx prisma db push

echo ""
echo "Setup complete! Run 'npm run dev' to start the development server."
echo "Run 'npm run db:studio' to open Prisma Studio and view your database."
