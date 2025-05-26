// Mock data for testing
const mockTransactions = [
    { date: '2024-03-15', description: 'Client Payment - Project A', category: 'Income', amount: 2500.00, type: 'income' },
    { date: '2024-03-14', description: 'Office Supplies', category: 'Expenses', amount: 150.75, type: 'expense' },
    { date: '2024-03-13', description: 'Internet Bill', category: 'Utilities', amount: 89.99, type: 'expense' },
    { date: '2024-03-12', description: 'Consulting Fee', category: 'Income', amount: 1200.00, type: 'income' },
    { date: '2024-03-11', description: 'Marketing Materials', category: 'Marketing', amount: 350.50, type: 'expense' }
];

// Calculate dashboard totals
function calculateTotals(transactions) {
    const totals = {
        income: 0,
        expenses: 0,
        profit: 0
    };

    transactions.forEach(tx => {
        if (tx.type === 'income') {
            totals.income += parseFloat(tx.amount);
        } else {
            totals.expenses += parseFloat(tx.amount);
        }
    });

    totals.profit = totals.income - totals.expenses;
    return totals;
}

// Update dashboard numbers
function updateDashboard(transactions) {
    const totals = calculateTotals(transactions);
    
    // Update dashboard cards with correct IDs
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const totalProfit = document.getElementById('totalProfit');
    const pendingInvoices = document.getElementById('pendingInvoices');

    if (totalIncome) totalIncome.textContent = formatCurrency(totals.income);
    if (totalExpenses) totalExpenses.textContent = formatCurrency(totals.expenses);
    if (totalProfit) totalProfit.textContent = formatCurrency(totals.profit);
    if (pendingInvoices) pendingInvoices.textContent = totals.pending || '0';

    // Update recent transactions
    const recentBody = document.getElementById('recentTransactionsBody');
    if (recentBody) {
        recentBody.innerHTML = transactions.slice(0, 5).map(tx => `
            <tr>
                <td class="px-4 py-2">${formatDate(tx.date)}</td>
                <td class="px-4 py-2">${tx.description}</td>
                <td class="px-4 py-2">${tx.category}</td>
                <td class="px-4 py-2 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}">
                    ${formatCurrency(tx.amount)}
                </td>
                <td class="px-4 py-2">${tx.type}</td>
            </tr>
        `).join('');
    }

    // Update charts
    updateCharts(transactions);
}

// Render transactions in the dashboard and transactions table
function renderTransactions(transactions) {
    // Recent Transactions (show up to 5)
    const recentBody = document.getElementById('recentTransactionsBody');
    if (recentBody) {
        recentBody.innerHTML = '';
        transactions.slice(0, 5).forEach(tx => {
            recentBody.innerHTML += `
                <tr>
                    <td class="px-4 py-2">${formatDate(tx.date)}</td>
                    <td class="px-4 py-2">${tx.description}</td>
                    <td class="px-4 py-2">${tx.category}</td>
                    <td class="px-4 py-2 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}">
                        ${formatCurrency(tx.amount)}
                    </td>
                    <td class="px-4 py-2">${tx.type}</td>
                </tr>
            `;
        });
    }

    // All Transactions
    const allTransactionsBody = document.getElementById('allTransactionsBody');
    if (allTransactionsBody) {
        allTransactionsBody.innerHTML = '';
        transactions.forEach(tx => {
            allTransactionsBody.innerHTML += `
                <tr>
                    <td class="px-4 py-2">${formatDate(tx.date)}</td>
                    <td class="px-4 py-2">${tx.description}</td>
                    <td class="px-4 py-2">${tx.category}</td>
                    <td class="px-4 py-2 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}">
                        ${formatCurrency(tx.amount)}
                    </td>
                    <td class="px-4 py-2">${tx.type}</td>
                    <td class="px-4 py-2">
                        <button class="text-red-500 hover:text-red-700" onclick="deleteTransaction('${tx.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Update dashboard
    updateDashboard(transactions);
}

// Load and render all transactions
async function loadAndRenderTransactions() {
    try {
        const transactions = await db.fetchTransactions();
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        showMessage('Error loading transactions', 'error');
    }
}

// Chart instances
let incomeExpensesChart = null;
let categoryChart = null;

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts...');
    
    // Income vs Expenses Chart
    const incomeExpensesCtx = document.getElementById('incomeExpensesChart');
    if (incomeExpensesCtx) {
        incomeExpensesChart = new Chart(incomeExpensesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        backgroundColor: 'rgba(34, 197, 94, 0.5)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1,
                        data: []
                    },
                    {
                        label: 'Expenses',
                        backgroundColor: 'rgba(239, 68, 68, 0.5)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1,
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Category Breakdown Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',   // Red
                        'rgba(59, 130, 246, 0.7)',  // Blue
                        'rgba(16, 185, 129, 0.7)',  // Green
                        'rgba(245, 158, 11, 0.7)',  // Yellow
                        'rgba(139, 92, 246, 0.7)',  // Purple
                        'rgba(249, 115, 22, 0.7)',  // Orange
                        'rgba(236, 72, 153, 0.7)',  // Pink
                        'rgba(6, 182, 212, 0.7)',   // Cyan
                        'rgba(168, 85, 247, 0.7)',  // Violet
                        'rgba(234, 179, 8, 0.7)'    // Amber
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// Update charts with transaction data
function updateCharts(transactions) {
    console.log('Updating charts with transactions:', transactions);
    
    // Group transactions by month for Income vs Expenses chart
    const monthlyData = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expenses: 0 };
        }
        
        if (tx.type === 'income') {
            monthlyData[monthYear].income += parseFloat(tx.amount);
        } else {
            monthlyData[monthYear].expenses += parseFloat(tx.amount);
        }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
    });

    // Update Income vs Expenses chart
    if (incomeExpensesChart) {
        incomeExpensesChart.data.labels = sortedMonths;
        incomeExpensesChart.data.datasets[0].data = sortedMonths.map(month => monthlyData[month].income);
        incomeExpensesChart.data.datasets[1].data = sortedMonths.map(month => monthlyData[month].expenses);
        incomeExpensesChart.update();
    }

    // Group transactions by category for Category Breakdown chart
    const categoryData = {};
    transactions.forEach(tx => {
        if (tx.type === 'expense') {
            if (!categoryData[tx.category]) {
                categoryData[tx.category] = 0;
            }
            categoryData[tx.category] += parseFloat(tx.amount);
        }
    });

    // Update Category Breakdown chart
    if (categoryChart) {
        categoryChart.data.labels = Object.keys(categoryData);
        categoryChart.data.datasets[0].data = Object.values(categoryData);
        categoryChart.update();
    }
}

// Initialize the application
async function initApp() {
    try {
        console.log('Initializing application...');
        
        // Load components
        await Promise.all([
            loadComponent('navbar', 'components/navbar.html'),
            loadComponent('dashboard', 'components/dashboard.html'),
            loadComponent('transactions', 'components/transactions.html'),
            loadComponent('footer', 'components/footer.html'),
            loadComponent('add-transaction', 'components/add-transaction.html')
        ]);
        
        // Initialize charts
        initializeCharts();
        
        // Set up event handlers
        setupAddTransactionHandlers();
        
        // Initialize settings manager
        if (typeof SettingsManager === 'function') {
            window.settingsManager = new SettingsManager();
        } else {
            console.error('SettingsManager class not found');
        }
        
        // Initialize input handlers
        if (window.initializeInputHandlers) {
            window.initializeInputHandlers();
        } else {
            console.error('Input handlers not found');
        }
        
        // Fetch and display initial data
        const transactions = await db.fetchTransactions();
        updateDashboard(transactions);
        updateTransactionsList(transactions);
        updateCharts(transactions);
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Error loading application. Please refresh the page.');
    }
}

// Load a component from its HTML file
async function loadComponent(componentId, url) {
    try {
        console.log(`Loading component: ${componentId} from ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.statusText}`);
        }
        const html = await response.text();
        const element = document.getElementById(componentId);
        if (!element) {
            throw new Error(`Component element not found: ${componentId}`);
        }
        element.innerHTML = html;
        console.log(`Component loaded successfully: ${componentId}`);

        // Set up event handlers for add-transaction component
        if (componentId === 'add-transaction') {
            setupAddTransactionHandlers();
        }
    } catch (error) {
        console.error(`Error loading component ${componentId}:`, error);
        throw error;
    }
}

// Set up event handlers for the add transaction form
function setupAddTransactionHandlers() {
    console.log('Setting up add transaction handlers...');
    
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const modal = document.getElementById('addTransactionModal');
    const closeBtn = document.getElementById('closeTransactionModal');
    const form = document.getElementById('transactionForm');
    const typeInput = document.getElementById('transactionType');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const categoryInput = document.getElementById('category');
    const dateInput = document.getElementById('date');

    console.log('Found elements:', {
        addTransactionBtn: !!addTransactionBtn,
        modal: !!modal,
        closeBtn: !!closeBtn,
        form: !!form,
        typeInput: !!typeInput,
        amountInput: !!amountInput,
        descriptionInput: !!descriptionInput,
        categoryInput: !!categoryInput,
        dateInput: !!dateInput
    });

    if (!addTransactionBtn || !modal || !closeBtn || !form) {
        console.error('Required elements not found:', {
            addTransactionBtn: !!addTransactionBtn,
            modal: !!modal,
            closeBtn: !!closeBtn,
            form: !!form
        });
        return;
    }

    // Add Transaction button click handler
    addTransactionBtn.addEventListener('click', () => {
        console.log('Add Transaction button clicked');
        modal.style.display = 'flex';
        dateInput.valueAsDate = new Date();
        
        // Initialize voice and photo input when modal opens
        setupPhotoInput();
        populateCategories();
        setupTransactionTypeButtons();
    });

    // Close button click handler
    closeBtn.addEventListener('click', () => {
        console.log('Close button clicked');
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        try {
            // Get form data
            const formData = new FormData(form);
            const transaction = {
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description'),
                category: formData.get('category'),
                date: formData.get('date')
            };

            console.log('Form data:', transaction);

            // Validate form data
            if (!transaction.type) {
                throw new Error('Please select a transaction type (Income/Expense)');
            }
            if (!transaction.amount || isNaN(transaction.amount) || transaction.amount <= 0) {
                throw new Error('Please enter a valid amount');
            }
            if (!transaction.description) {
                throw new Error('Please enter a description');
            }
            if (!transaction.category) {
                throw new Error('Please select a category');
            }
            if (!transaction.date) {
                throw new Error('Please select a date');
            }

            // Add transaction to database
            const newTransaction = await db.addTransaction(transaction);
            console.log('Transaction added:', newTransaction);

            // Update UI
            const transactions = await db.fetchTransactions();
            updateDashboard(transactions);
            updateTransactionsList(transactions);

            // Clear form and close modal
            form.reset();
            modal.style.display = 'none';
            showSuccess('Transaction added successfully!');

        } catch (error) {
            console.error('Error adding transaction:', error);
            showError(error.message || 'Error adding transaction. Please try again.');
        }
    });

    // Transaction type button handlers
    const incomeBtn = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');

    if (incomeBtn && expenseBtn && typeInput) {
        incomeBtn.addEventListener('click', () => {
            incomeBtn.classList.add('bg-primary-100', 'text-primary-700');
            expenseBtn.classList.remove('bg-primary-100', 'text-primary-700');
            typeInput.value = 'income';
        });

        expenseBtn.addEventListener('click', () => {
            expenseBtn.classList.add('bg-primary-100', 'text-primary-700');
            incomeBtn.classList.remove('bg-primary-100', 'text-primary-700');
            typeInput.value = 'expense';
        });
    }

    // Tab switching handlers
    const manualTab = document.getElementById('manualTab');
    const voiceTab = document.getElementById('voiceTab');
    const photoTab = document.getElementById('photoTab');
    const manualInput = document.getElementById('manualInput');
    const voiceInput = document.getElementById('voiceInput');
    const photoInput = document.getElementById('photoInput');

    if (manualTab && voiceTab && photoTab) {
        manualTab.addEventListener('click', () => {
            manualTab.classList.add('text-primary-500', 'border-primary-500');
            voiceTab.classList.remove('text-primary-500', 'border-primary-500');
            photoTab.classList.remove('text-primary-500', 'border-primary-500');
            manualInput.classList.remove('hidden');
            voiceInput.classList.add('hidden');
            photoInput.classList.add('hidden');
        });

        voiceTab.addEventListener('click', () => {
            voiceTab.classList.add('text-primary-500', 'border-primary-500');
            manualTab.classList.remove('text-primary-500', 'border-primary-500');
            photoTab.classList.remove('text-primary-500', 'border-primary-500');
            voiceInput.classList.remove('hidden');
            manualInput.classList.add('hidden');
            photoInput.classList.add('hidden');
        });

        photoTab.addEventListener('click', () => {
            photoTab.classList.add('text-primary-500', 'border-primary-500');
            manualTab.classList.remove('text-primary-500', 'border-primary-500');
            voiceTab.classList.remove('text-primary-500', 'border-primary-500');
            photoInput.classList.remove('hidden');
            manualInput.classList.add('hidden');
            voiceInput.classList.add('hidden');
        });
    }

    // Voice input handler
    const startVoiceBtn = document.getElementById('startVoiceBtn');
    if (startVoiceBtn && window.voiceRecognition) {
        startVoiceBtn.addEventListener('click', () => {
            const voiceOutput = document.getElementById('voiceOutput');
            if (voiceOutput) {
                voiceOutput.textContent = '';
                voiceOutput.classList.add('hidden');
            }
            window.voiceRecognition.start();
            showMessage('Listening...', 'success');
        });
    }

    console.log('Add transaction handlers set up successfully');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Show message to user
function showMessage(message, type = 'success') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    messageDiv.textContent = message;

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// UI polish: add modal transitions and button/card hover effects
// (Tailwind already provides some, but let's add a little more)
document.addEventListener('DOMContentLoaded', function() {
    // Modal fade-in
    const modal = document.getElementById('addTransactionModal');
    if (modal) {
        modal.classList.add('transition-opacity', 'duration-300');
    }
    // Button hover sound (optional)
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => playAudio('success'));
    });
});

// Modal and form interaction handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up event handlers');
    
    // Transaction type buttons
    const incomeBtn = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');
    const transactionType = document.getElementById('transactionType');

    if (incomeBtn && expenseBtn) {
        incomeBtn.addEventListener('click', () => {
            incomeBtn.classList.add('bg-primary-100', 'text-primary-700');
            expenseBtn.classList.remove('bg-primary-100', 'text-primary-700');
            transactionType.value = 'income';
        });

        expenseBtn.addEventListener('click', () => {
            expenseBtn.classList.add('bg-primary-100', 'text-primary-700');
            incomeBtn.classList.remove('bg-primary-100', 'text-primary-700');
            transactionType.value = 'expense';
        });
    }

    // Input method tabs
    const manualTab = document.getElementById('manualTab');
    const voiceTab = document.getElementById('voiceTab');
    const photoTab = document.getElementById('photoTab');
    const manualInput = document.getElementById('manualInput');
    const voiceInput = document.getElementById('voiceInput');
    const photoInput = document.getElementById('photoInput');

    if (manualTab && voiceTab && photoTab) {
        manualTab.addEventListener('click', () => {
            manualTab.classList.add('text-primary-500', 'border-primary-500');
            voiceTab.classList.remove('text-primary-500', 'border-primary-500');
            photoTab.classList.remove('text-primary-500', 'border-primary-500');
            manualInput.classList.remove('hidden');
            voiceInput.classList.add('hidden');
            photoInput.classList.add('hidden');
        });

        voiceTab.addEventListener('click', () => {
            voiceTab.classList.add('text-primary-500', 'border-primary-500');
            manualTab.classList.remove('text-primary-500', 'border-primary-500');
            photoTab.classList.remove('text-primary-500', 'border-primary-500');
            voiceInput.classList.remove('hidden');
            manualInput.classList.add('hidden');
            photoInput.classList.add('hidden');
        });

        photoTab.addEventListener('click', () => {
            photoTab.classList.add('text-primary-500', 'border-primary-500');
            manualTab.classList.remove('text-primary-500', 'border-primary-500');
            voiceTab.classList.remove('text-primary-500', 'border-primary-500');
            photoInput.classList.remove('hidden');
            manualInput.classList.add('hidden');
            voiceInput.classList.add('hidden');
        });
    }

    // Populate categories
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        const categories = [
            'Income',
            'Expenses',
            'Utilities',
            'Marketing',
            'Technology',
            'Education',
            'Travel',
            'Food',
            'Entertainment',
            'Other'
        ];
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}); 
