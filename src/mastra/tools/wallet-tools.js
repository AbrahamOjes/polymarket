/**
 * Wallet Management Tools
 * Handle user wallet operations, balance tracking, and transaction history
 */

const { createTool } = require('@mastra/core/tools');
const { z } = require('zod');
const fs = require('fs').promises;
const path = require('path');

// Simple file-based wallet storage (in production, use a database)
const WALLET_FILE = path.join(__dirname, '../../../data/wallets.json');

/**
 * Initialize Wallet Tool
 * Creates or retrieves a user's wallet
 */
const initializeWalletTool = createTool({
  id: 'initialize-wallet',
  description: 'Creates a new wallet for a user or retrieves existing wallet.',
  inputSchema: z.object({
    userId: z.string().describe('User identifier'),
    initialBalance: z.number().default(0).describe('Initial balance to add (optional)')
  }),
  outputSchema: z.object({
    userId: z.string(),
    walletId: z.string(),
    balance: z.number(),
    currency: z.string(),
    createdAt: z.string(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, initialBalance } = context;
    
    try {
      const wallets = await loadWallets();
      
      // Check if wallet exists
      if (wallets[userId]) {
        return {
          userId,
          walletId: wallets[userId].walletId,
          balance: wallets[userId].balance,
          currency: 'USD',
          createdAt: wallets[userId].createdAt,
          message: 'Wallet already exists'
        };
      }
      
      // Create new wallet
      const walletId = `wallet_${Date.now()}_${userId}`;
      const wallet = {
        walletId,
        balance: initialBalance,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        transactions: []
      };
      
      wallets[userId] = wallet;
      await saveWallets(wallets);
      
      return {
        userId,
        walletId,
        balance: initialBalance,
        currency: 'USD',
        createdAt: wallet.createdAt,
        message: 'Wallet created successfully'
      };
      
    } catch (error) {
      console.error('Error initializing wallet:', error);
      throw new Error(`Wallet initialization failed: ${error.message}`);
    }
  }
});

/**
 * Add Funds Tool
 * Adds funds to a user's wallet
 */
const addFundsTool = createTool({
  id: 'add-funds',
  description: 'Adds funds to a user wallet.',
  inputSchema: z.object({
    userId: z.string(),
    amount: z.number().positive().describe('Amount to add'),
    source: z.string().default('deposit').describe('Source of funds')
  }),
  outputSchema: z.object({
    userId: z.string(),
    previousBalance: z.number(),
    newBalance: z.number(),
    amountAdded: z.number(),
    transactionId: z.string(),
    timestamp: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, amount, source } = context;
    
    try {
      const wallets = await loadWallets();
      
      if (!wallets[userId]) {
        throw new Error('Wallet not found. Please initialize wallet first.');
      }
      
      const previousBalance = wallets[userId].balance;
      wallets[userId].balance += amount;
      
      const transaction = {
        id: `txn_${Date.now()}`,
        type: 'deposit',
        amount,
        source,
        timestamp: new Date().toISOString(),
        balanceAfter: wallets[userId].balance
      };
      
      wallets[userId].transactions.push(transaction);
      await saveWallets(wallets);
      
      return {
        userId,
        previousBalance,
        newBalance: wallets[userId].balance,
        amountAdded: amount,
        transactionId: transaction.id,
        timestamp: transaction.timestamp
      };
      
    } catch (error) {
      console.error('Error adding funds:', error);
      throw new Error(`Add funds failed: ${error.message}`);
    }
  }
});

/**
 * Get Balance Tool
 * Retrieves current wallet balance
 */
const getBalanceTool = createTool({
  id: 'get-balance',
  description: 'Gets the current balance of a user wallet.',
  inputSchema: z.object({
    userId: z.string()
  }),
  outputSchema: z.object({
    userId: z.string(),
    balance: z.number(),
    currency: z.string(),
    availableForTrading: z.number(),
    lockedInTrades: z.number()
  }),
  execute: async ({ context }) => {
    const { userId } = context;
    
    try {
      const wallets = await loadWallets();
      
      if (!wallets[userId]) {
        throw new Error('Wallet not found');
      }
      
      const wallet = wallets[userId];
      const lockedInTrades = calculateLockedFunds(wallet.transactions);
      
      return {
        userId,
        balance: wallet.balance,
        currency: 'USD',
        availableForTrading: wallet.balance - lockedInTrades,
        lockedInTrades
      };
      
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Get balance failed: ${error.message}`);
    }
  }
});

/**
 * Record Trade Tool
 * Records a trade transaction in the wallet
 */
const recordTradeTool = createTool({
  id: 'record-trade',
  description: 'Records a trade transaction in the user wallet.',
  inputSchema: z.object({
    userId: z.string(),
    marketId: z.string(),
    amount: z.number(),
    outcome: z.enum(['YES', 'NO']),
    type: z.enum(['BUY', 'SELL']),
    price: z.number()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    transactionId: z.string(),
    newBalance: z.number(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    const { userId, marketId, amount, outcome, type, price } = context;
    
    try {
      const wallets = await loadWallets();
      
      if (!wallets[userId]) {
        throw new Error('Wallet not found');
      }
      
      // Check sufficient balance for BUY
      if (type === 'BUY' && wallets[userId].balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Update balance
      if (type === 'BUY') {
        wallets[userId].balance -= amount;
      } else {
        wallets[userId].balance += amount;
      }
      
      const transaction = {
        id: `txn_${Date.now()}`,
        type: 'trade',
        tradeType: type,
        marketId,
        amount,
        outcome,
        price,
        timestamp: new Date().toISOString(),
        balanceAfter: wallets[userId].balance
      };
      
      wallets[userId].transactions.push(transaction);
      await saveWallets(wallets);
      
      return {
        success: true,
        transactionId: transaction.id,
        newBalance: wallets[userId].balance,
        message: `Trade recorded: ${type} ${outcome} for $${amount}`
      };
      
    } catch (error) {
      console.error('Error recording trade:', error);
      return {
        success: false,
        transactionId: '',
        newBalance: 0,
        message: error.message
      };
    }
  }
});

/**
 * Get Transaction History Tool
 * Retrieves wallet transaction history
 */
const getTransactionHistoryTool = createTool({
  id: 'get-transaction-history',
  description: 'Gets transaction history for a user wallet.',
  inputSchema: z.object({
    userId: z.string(),
    limit: z.number().default(20).describe('Number of transactions to retrieve')
  }),
  outputSchema: z.object({
    userId: z.string(),
    transactions: z.array(z.object({
      id: z.string(),
      type: z.string(),
      amount: z.number(),
      timestamp: z.string(),
      balanceAfter: z.number()
    })),
    totalTransactions: z.number()
  }),
  execute: async ({ context }) => {
    const { userId, limit } = context;
    
    try {
      const wallets = await loadWallets();
      
      if (!wallets[userId]) {
        throw new Error('Wallet not found');
      }
      
      const transactions = wallets[userId].transactions || [];
      const recentTransactions = transactions.slice(-limit).reverse();
      
      return {
        userId,
        transactions: recentTransactions,
        totalTransactions: transactions.length
      };
      
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error(`Get transaction history failed: ${error.message}`);
    }
  }
});

// Helper functions

async function loadWallets() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(WALLET_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Try to read wallets file
    try {
      const data = await fs.readFile(WALLET_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      // File doesn't exist, return empty object
      return {};
    }
  } catch (error) {
    console.error('Error loading wallets:', error);
    return {};
  }
}

async function saveWallets(wallets) {
  try {
    const dataDir = path.dirname(WALLET_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(WALLET_FILE, JSON.stringify(wallets, null, 2));
  } catch (error) {
    console.error('Error saving wallets:', error);
    throw error;
  }
}

function calculateLockedFunds(transactions) {
  // Calculate funds locked in open positions
  // In a real implementation, this would check open positions
  return 0;
}

module.exports = {
  initializeWalletTool,
  addFundsTool,
  getBalanceTool,
  recordTradeTool,
  getTransactionHistoryTool
};
