// Settings Management
class SettingsManager {
    constructor() {
        this.settings = {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            darkMode: false,
            notifications: {
                enabled: false,
                monthlyReport: false
            }
        };
        this.loadSettings();
        this.setupEventListeners();
        this.applyDarkMode();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('trackjoy_settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.updateUI();
        }
    }

    saveSettings() {
        localStorage.setItem('trackjoy_settings', JSON.stringify(this.settings));
        this.updateUI();
        this.applyDarkMode();
        showMessage('Settings saved successfully!', 'success');
    }

    applyDarkMode() {
        if (this.settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    updateUI() {
        // Update currency select
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = this.settings.currency;
        }

        // Update date format select
        const dateFormatSelect = document.getElementById('dateFormatSelect');
        if (dateFormatSelect) {
            dateFormatSelect.value = this.settings.dateFormat;
        }

        // Update dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const moonIcon = darkModeToggle.querySelector('.fa-moon');
            const sunIcon = darkModeToggle.querySelector('.fa-sun');
            if (this.settings.darkMode) {
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
            } else {
                moonIcon.classList.remove('hidden');
                sunIcon.classList.add('hidden');
            }
        }

        // Update notification checkboxes
        const enableNotifications = document.getElementById('enableNotifications');
        const monthlyReport = document.getElementById('monthlyReport');
        if (enableNotifications) {
            enableNotifications.checked = this.settings.notifications.enabled;
        }
        if (monthlyReport) {
            monthlyReport.checked = this.settings.notifications.monthlyReport;
        }
    }

    setupEventListeners() {
        // Settings button click
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsModal = document.getElementById('closeSettingsModal');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
            });
        }

        if (closeSettingsModal && settingsModal) {
            closeSettingsModal.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.style.display = 'none';
                }
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.settings.darkMode = !this.settings.darkMode;
                this.saveSettings();
            });
        }

        // Save settings
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.settings.currency = document.getElementById('currencySelect').value;
                this.settings.dateFormat = document.getElementById('dateFormatSelect').value;
                this.settings.notifications.enabled = document.getElementById('enableNotifications').checked;
                this.settings.notifications.monthlyReport = document.getElementById('monthlyReport').checked;
                this.saveSettings();
                settingsModal.style.display = 'none';
            });
        }

        // Export data
        const exportDataBtn = document.getElementById('exportData');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // Import data
        const importDataBtn = document.getElementById('importData');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.importData());
        }

        // Download monthly chart
        const downloadChartBtn = document.getElementById('downloadChart');
        if (downloadChartBtn) {
            downloadChartBtn.addEventListener('click', () => this.downloadMonthlyChart());
        }
    }

    async downloadMonthlyChart() {
        try {
            const canvas = document.getElementById('incomeExpensesChart');
            if (!canvas) {
                throw new Error('Chart not found');
            }

            // Create a temporary canvas for better quality
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width * 2;
            tempCanvas.height = canvas.height * 2;
            tempCtx.scale(2, 2);
            tempCtx.drawImage(canvas, 0, 0);

            // Convert to blob and download
            const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png', 1.0));
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date();
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            a.href = url;
            a.download = `trackjoy_chart_${monthYear}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('Chart downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading chart:', error);
            showMessage('Error downloading chart', 'error');
        }
    }

    async exportData() {
        try {
            const transactions = await db.fetchTransactions();
            const data = {
                transactions,
                settings: this.settings,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trackjoy_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showMessage('Error exporting data', 'error');
        }
    }

    async importData() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        // Validate data structure
                        if (!data.transactions || !Array.isArray(data.transactions)) {
                            throw new Error('Invalid data format');
                        }

                        // Import transactions
                        for (const transaction of data.transactions) {
                            await db.addTransaction(transaction);
                        }

                        // Import settings if available
                        if (data.settings) {
                            this.settings = data.settings;
                            this.saveSettings();
                        }

                        showMessage('Data imported successfully!', 'success');
                        window.location.reload(); // Refresh to show new data
                    } catch (error) {
                        console.error('Error importing data:', error);
                        showMessage('Error importing data: Invalid file format', 'error');
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        } catch (error) {
            console.error('Error importing data:', error);
            showMessage('Error importing data', 'error');
        }
    }
}

// Initialize settings manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
}); 