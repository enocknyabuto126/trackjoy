// Initialize Supabase client
const SUPABASE_URL = 'https://lbkxpqymhwezjilwcrye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxia3hwcXltaHdlemppbHdjcnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTc4MjksImV4cCI6MjA2MzgzMzgyOX0.d48tTsnVvPbmCQyeCGRQDDDJBsDdFoGllDcMoQJj_JA';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Database operations
const db = {
    // Fetch all transactions
    async fetchTransactions() {
        try {
            console.log('Attempting to fetch transactions...');
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching transactions:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('Successfully fetched transactions:', data);
            return data || [];
        } catch (error) {
            console.error('Error in fetchTransactions:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
    },

    // Add a new transaction
    async addTransaction(transaction) {
        try {
            console.log('Attempting to add transaction:', transaction);
            
            // First, check if we can access the table
            const { data: testData, error: testError } = await supabase
                .from('transactions')
                .select('id')
                .limit(1);

            if (testError) {
                console.error('Error accessing transactions table:', {
                    message: testError.message,
                    details: testError.details,
                    hint: testError.hint,
                    code: testError.code
                });
                throw new Error(`Unable to access transactions table: ${testError.message}`);
            }

            // Then try to insert the transaction
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    date: transaction.date,
                    description: transaction.description,
                    category: transaction.category,
                    amount: transaction.amount,
                    type: transaction.type
                }])
                .select();

            if (error) {
                console.error('Error adding transaction:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                
                if (error.message.includes('row-level security')) {
                    throw new Error('Database access denied. Please check your database permissions.');
                }
                throw error;
            }

            console.log('Successfully added transaction:', data);
            return data[0];
        } catch (error) {
            console.error('Error in addTransaction:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
    },

    // Delete a transaction
    async deleteTransaction(transactionId) {
        try {
            console.log('Attempting to delete transaction:', transactionId);
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId);

            if (error) {
                console.error('Error deleting transaction:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('Successfully deleted transaction');
            return true;
        } catch (error) {
            console.error('Error in deleteTransaction:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
    },

    // Update a transaction
    async updateTransaction(transactionId, updates) {
        try {
            console.log('Attempting to update transaction:', { transactionId, updates });
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', transactionId)
                .select();

            if (error) {
                console.error('Error updating transaction:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('Successfully updated transaction:', data);
            return data[0];
        } catch (error) {
            console.error('Error in updateTransaction:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
    }
}; 