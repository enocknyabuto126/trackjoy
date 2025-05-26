// Initialize Supabase client
const SUPABASE_URL = 'https://lbkxpqymhwezjilwcrye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxia3hwcXltaHdlemppbHdjcnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTc4MjksImV4cCI6MjA2MzgzMzgyOX0.d48tTsnVvPbmCQyeCGRQDDDJBsDdFoGllDcMoQJj_JA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Database operations
const db = {
    // Fetch all transactions
    async fetchTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching transactions:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in fetchTransactions:', error);
            throw error;
        }
    },

    // Add a new transaction
    async addTransaction(transaction) {
        try {
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
                console.error('Error adding transaction:', error);
                throw error;
            }

            return data[0];
        } catch (error) {
            console.error('Error in addTransaction:', error);
            throw error;
        }
    },

    // Delete a transaction
    async deleteTransaction(transactionId) {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId);

            if (error) {
                console.error('Error deleting transaction:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteTransaction:', error);
            throw error;
        }
    },

    // Update a transaction
    async updateTransaction(transactionId, updates) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', transactionId)
                .select();

            if (error) {
                console.error('Error updating transaction:', error);
                throw error;
            }

            return data[0];
        } catch (error) {
            console.error('Error in updateTransaction:', error);
            throw error;
        }
    }
}; 