# Money Tracker 2.0

A comprehensive money tracking application to manage your finances, loans, budgets, reminders, savings, and analyze your spending patterns.

## Features

1. **Loans Tracker** - Track all your loans with remaining amounts, interest rates, monthly payments, and due dates
2. **Budget** - Set spending limits by category and track your progress
3. **Reminders** - Set reminders for recharges and auto-pay bills with recurring options
4. **Analytics** - Visualize your spending with charts and insights
5. **Calendar** - View daily spending amounts directly on a calendar
6. **Savings** - Track your cash savings with optional goals

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **Lucide React** - Icons
- **Local Storage** - Data persistence

## Project Structure

```
src/
├── components/     # Reusable components
├── context/        # React context for state management
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── App.tsx         # Main app component
```

## Usage

### Adding Transactions
- Navigate to Calendar page and click on any date or use the "Add Transaction" button
- Fill in the transaction details (amount, description, category, type, date)

### Managing Loans
- Go to Loans page
- Click "Add Loan" to track a new loan
- Edit or delete loans as needed
- View progress bars showing payment status

### Setting Budgets
- Go to Budget page
- Create budgets by category with spending limits
- View real-time spending vs. budget with visual indicators

### Setting Reminders
- Go to Reminders page
- Add reminders for recharges or auto-pay bills
- Set recurring reminders if needed
- Mark reminders as completed when done

### Viewing Analytics
- Go to Analytics page
- See spending breakdowns by category
- View monthly income vs. expenses
- Check top spending categories

### Tracking Savings
- Go to Savings page
- Add savings entries with optional goals
- Add or subtract amounts as needed
- Track progress toward goals

## Data Storage

All data is stored locally in your browser's localStorage. Your data persists between sessions but is specific to the browser you're using.

## License

MIT
