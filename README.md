# Chat Wallet - Personal Expense Tracker

This project is a Natural Language Processing (NLP) application designed to interact with a simple database using natural language prompts. The project leverages the Gemini framework to process user inputs and execute database operations.

Members: Luoqi Zhao, Daniel Jones, and Ryan Vera

## Project Overview

Chat Wallet is a modern personal expense tracking application built with Next.js and React. It allows users to record their daily income and expenses in a simple, intuitive interface and provides clear financial overviews.

## Key Features

- 📝 Record daily expenses and income
- 📅 View transactions by month or year
- 📊 View income, expense, and balance summaries
- ✏️ Edit and delete existing transactions
- 💬 Add transactions through natural language (connected to backend AI service)
- 📱 Responsive design for all devices

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS

## Installation Guide

1. Clone the repository

```bash
git clone https://github.com/your-username/chat-wallet-next.git
cd chat-wallet-next
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   Create a `.env.local` file and add:

```
API_DOMAIN=http://localhost:8000  # Adjust according to your backend service
```

4. Start the development server

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser

## Usage Instructions

### Adding Transactions

- Click the "+" button at the bottom of the interface to manually add a transaction
- Or type a natural language description in the input box (e.g., "Spent $50 on groceries on May 15th, 2025")

### Viewing Transaction History

- Click the date at the top to switch between years and months
- View transactions and financial summaries for specific time periods

### Editing/Deleting Transactions

- Click on any transaction item to edit it
- Click the delete icon on the right side of a transaction to delete it

## Backend Service

This application needs to connect to a backend API service for natural language processing and data storage. It's stored at another github repo.
