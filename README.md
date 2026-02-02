# Gold Monitoring Dashboard

A high-fidelity, dark-mode financial dashboard designed for tracking real-time Gold (XAU/USD) prices, market activity, and global reserves. The application integrates Google's Gemini API to provide AI-powered market sentiment analysis and live news updates.

## Features

### 📊 Real-Time Market Data
- **Live Price Tracking:** Monitor Gold prices (XAU/USD) with interactive charts.
- **Dynamic Time Ranges:** Switch between 1D, 7D, 1M, 6M, and 1Y views.
- **Unit Conversion:** Toggle price views between Troy Ounce (oz), Gram (g), and Chi/Tael.
- **Volume Analysis:** Visualize trading volume alongside price action.
- **Global Reserves:** Interactive table showing top national gold holdings, with values dynamically calculated based on the live spot price.

### 🧠 AI Market Intelligence
- **Powered by Gemini:** Uses Google's `@google/genai` SDK to analyze market trends.
- **Executive Summaries:** Generates concise, 1-sentence market sentiment analysis (Bullish/Bearish/Neutral).
- **Live News Feed:** Fetches the latest relevant news using Gemini with Google Search Grounding or OpenRouter.
- **Smart Formatting:** automatically rounds complex percentages and highlights key insights.

### 🎨 UI/UX Design
- **High-Fidelity Dark Mode:** Professional financial aesthetic with zinc/lime color palette.
- **Film Grain Texture:** Custom "card noise" effects for a tactile feel.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.
- **Loading States:** Shimmer effects and skeleton loaders for smooth data transitions.

## Tech Stack

- **Framework:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** Recharts
- **Icons:** Lucide React
- **AI Integration:** Google Gemini API (`@google/genai`), OpenRouter
- **Market Data:** Twelve Data API

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A **Google Gemini API Key** (for AI insights).
- A **Twelve Data API Key** (optional, for live market data).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goldpulse-dashboard.git
   cd goldpulse-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Configuration

### AI API Keys
The dashboard allows you to configure your AI provider directly via the UI:
1. Click the **"Connect AI"** button in the header.
2. Select **Google Gemini** (Recommended) or OpenRouter.
3. Enter your API Key.
   - **Gemini:** Keys typically start with `AIza...`.
   - **OpenRouter:** Keys typically start with `sk-or-...`.
4. Keys are stored securely in your browser's `localStorage`.

### Market Data API
By default, the app uses a fallback mock data generator if no data provider is configured. To use live financial data:
1. Obtain an API key from [Twelve Data](https://twelvedata.com/).
2. Update the `TWELVE_DATA_API_KEY` constant in `services/marketDataService.ts`.

## Disclaimer

This dashboard is for informational purposes only. No content should be interpreted as financial advice. Market data may be delayed or simulated depending on API configuration.

## License

MIT
