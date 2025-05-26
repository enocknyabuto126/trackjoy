# TrackJoy

TrackJoy is a modern, web-based finance tracker designed for small businesses. It helps you manage transactions, visualize financial data, and keep your business finances organized with ease.

## Features

- **Dashboard Overview:** Get a quick summary of your financial status with charts and key metrics.
- **Transaction Management:** Add, view, search, and categorize income and expenses.
- **Category Tracking:** Organize transactions by customizable categories.
- **Responsive UI:** Clean, mobile-friendly interface built with Tailwind CSS.
- **Dark Mode:** Seamless light/dark theme switching.
- **Data Visualization:** Interactive charts powered by Chart.js.
- **Cloud Sync:** Uses Supabase for secure, real-time data storage (configure your own Supabase project).

## Getting Started

### Prerequisites
- Modern web browser
- (Optional) Your own [Supabase](https://supabase.com/) project for persistent cloud storage

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/enocknyabuto126/trackjoy.git
   cd trackjoy
   ```
2. **Configure Supabase:**
   - Open `js/supabase-config.js` and enter your Supabase project URL and anon key.
3. **Open the app:**
   - Simply open `index.html` in your browser.

## Project Structure

- `index.html` - Main entry point
- `components/` - HTML UI components (navbar, dashboard, transactions, etc.)
- `js/` - JavaScript logic (main app, handlers, Supabase integration)
- `css/` - Custom styles

## Customization
- Update categories, UI, or add new features by editing the relevant files in `components/` and `js/`.
- Tailwind CSS and Font Awesome are used for styling and icons.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is open source and available under the [MIT License](LICENSE).

---

*TrackJoy – Simplifying small business finance management.*
