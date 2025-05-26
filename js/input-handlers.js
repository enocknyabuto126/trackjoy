// Voice Recognition Setup
let voiceRecognition = null;

function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        voiceRecognition = new webkitSpeechRecognition();
        voiceRecognition.continuous = false;
        voiceRecognition.lang = 'en-US';
        voiceRecognition.interimResults = false;

        voiceRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice input:', transcript);
            
            // Parse the voice input
            const amountMatch = transcript.match(/\$?(\d+(\.\d{2})?)/);
            const typeMatch = transcript.match(/(income|expense)/);
            const categoryMatch = transcript.match(/in\s+(\w+)\s+category/);
            
            if (amountMatch) {
                document.getElementById('amount').value = amountMatch[1];
            }
            if (typeMatch) {
                const type = typeMatch[1];
                document.getElementById('transactionType').value = type;
                if (type === 'income') {
                    document.getElementById('incomeBtn').click();
                } else {
                    document.getElementById('expenseBtn').click();
                }
            }
            if (categoryMatch) {
                const category = categoryMatch[1];
                const categorySelect = document.getElementById('category');
                for (let option of categorySelect.options) {
                    if (option.text.toLowerCase() === category.toLowerCase()) {
                        categorySelect.value = option.value;
                        break;
                    }
                }
            }
            
            // Set description
            document.getElementById('description').value = transcript;
            
            // Show the recognized text
            const voiceOutput = document.getElementById('voiceOutput');
            if (voiceOutput) {
                voiceOutput.textContent = transcript;
                voiceOutput.classList.remove('hidden');
            }
        };

        voiceRecognition.onerror = function(event) {
            console.error('Voice recognition error:', event.error);
            showMessage('Voice recognition error: ' + event.error, 'error');
        };

        voiceRecognition.onend = function() {
            console.log('Voice recognition ended');
        };

        // Set up voice button
        const startVoiceBtn = document.getElementById('startVoiceBtn');
        if (startVoiceBtn) {
            startVoiceBtn.addEventListener('click', () => {
                const voiceOutput = document.getElementById('voiceOutput');
                if (voiceOutput) {
                    voiceOutput.textContent = '';
                    voiceOutput.classList.add('hidden');
                }
                voiceRecognition.start();
                showMessage('Listening...', 'success');
            });
        }
    } else {
        console.warn('Voice recognition not supported in this browser');
    }
}

// Photo Input Setup
function setupPhotoInput() {
    console.log('Setting up photo input...');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const analyzeReceiptBtn = document.getElementById('analyzeReceiptBtn');

    if (!photoUpload || !photoPreview || !photoPreviewContainer || !analyzeReceiptBtn) {
        console.error('Photo input elements not found');
        return;
    }

    photoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreviewContainer.classList.remove('hidden');
                analyzeReceiptBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeReceiptBtn.addEventListener('click', function() {
        const file = photoUpload.files[0];
        if (!file) {
            showMessage('Please select an image first', 'error');
            return;
        }

        const loading = document.getElementById('receiptAnalysisLoading');
        if (loading) loading.classList.remove('hidden');

        // Simulate receipt analysis
        setTimeout(() => {
            if (loading) loading.classList.add('hidden');
            
            // Mock data for demonstration
            const mockAmount = (Math.random() * 100).toFixed(2);
            const mockDescription = 'Receipt from ' + ['Store', 'Restaurant', 'Shop'][Math.floor(Math.random() * 3)];
            
            document.getElementById('amount').value = mockAmount;
            document.getElementById('description').value = mockDescription;
            document.getElementById('category').value = 'Expenses';
            document.getElementById('expenseBtn').click();
            
            showMessage('Receipt analyzed successfully!', 'success');
        }, 1500);
    });
}

// Populate categories in the dropdown
function populateCategories() {
    console.log('Populating categories...');
    const categorySelect = document.getElementById('category');
    if (!categorySelect) {
        console.error('Category select element not found');
        return;
    }

    // Clear existing options except the first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }

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

// Set up transaction type buttons
function setupTransactionTypeButtons() {
    console.log('Setting up transaction type buttons...');
    const incomeBtn = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');
    const transactionType = document.getElementById('transactionType');

    if (!incomeBtn || !expenseBtn || !transactionType) {
        console.error('Transaction type elements not found');
        return;
    }

    // Set initial state
    incomeBtn.classList.add('bg-primary-100', 'text-primary-700');
    transactionType.value = 'income';

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

// Initialize all input handlers
function initializeInputHandlers() {
    console.log('Initializing input handlers...');
    setupVoiceRecognition();
    setupPhotoInput();
    populateCategories();
    setupTransactionTypeButtons();
}

// Export functions for use in main.js
window.initializeInputHandlers = initializeInputHandlers;
window.setupPhotoInput = setupPhotoInput;
window.populateCategories = populateCategories;
window.setupTransactionTypeButtons = setupTransactionTypeButtons;

// Set up tab switching
function setupTabSwitching() {
    const manualTab = document.getElementById('manualTab');
    const voiceTab = document.getElementById('voiceTab');
    const photoTab = document.getElementById('photoTab');
    const manualInput = document.getElementById('manualInput');
    const voiceInput = document.getElementById('voiceInput');
    const photoInput = document.getElementById('photoInput');

    // Set up modal open/close handlers
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const modal = document.getElementById('addTransactionModal');
    const closeTransactionModal = document.getElementById('closeTransactionModal');
    
    if (addTransactionBtn && modal) {
        addTransactionBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            populateCategories(); // Populate categories when modal opens
            setupTransactionTypeButtons(); // Set up transaction type buttons
            const dateInput = document.getElementById('date');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        });
    }

    if (closeTransactionModal && modal) {
        closeTransactionModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    if (manualTab && voiceTab && photoTab) {
        // Set initial state
        manualTab.classList.add('text-primary-500', 'border-primary-500');
        manualInput.classList.remove('hidden');
        voiceInput.classList.add('hidden');
        photoInput.classList.add('hidden');

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
}

// Initialize all input handlers
document.addEventListener('DOMContentLoaded', function() {
    initializeInputHandlers();
    setupTabSwitching();
}); 