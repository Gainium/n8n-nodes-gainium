# n8n-nodes-gainium

Integrate Gainium with n8n to manage bots, strategies, and deals directly in your workflows. This package lets you trigger actions, fetch data, and coordinate trading logic with the rest of your automation stack.

## ⚡ Gainium Overview

[Gainium](https://gainium.io) is a platform for building and running automated trading strategies. Key features include:

- Trading terminal
- Grid, DCA, and Combo bots
- Backtesting & paper trading
- Market screener
- Portfolio tracking
- Risk tools & auto-compounding
- Webhook-triggered actions

## 🤖 About n8n

[n8n](https://n8n.io) is a workflow automation tool that connects APIs and services. Use these nodes to tie trading logic to alerts, signals, data sources, or messaging tools—no custom backend required.

---

## 📚 API Documentation

📖 **Complete API Reference:** [https://api.gainium.io/api/docs/](https://api.gainium.io/api/docs/)

> 💡 **Tip:** The interactive API documentation includes detailed endpoint descriptions, request/response examples, and a built-in testing interface to help you understand and implement each feature.

---

## 🚀 What You Can Do

The nodes let you:

- Trigger bots on signals or events
- Monitor deals, positions, and PnL
- Pause, resume, close, or adjust bots and deals
- React to strategy alerts
- Retrieve account and performance data
- Combine with Telegram, Discord, TradingView, etc. for full workflows

---

## 🔧 Use Cases (Examples)

- Rebalance: Fetch balances + external prices, adjust allocations via bot actions.
- News / sentiment trigger: Pause or de-risk bots when negative sentiment spikes.
- Scheduled profit taking: Cron step-down of position size or bot aggressiveness.
- Volatility adaptation: Adjust grid/DCA parameters when volatility changes.
- Arbitrage alerting: Compare prices across exchanges and notify or trigger a deal.
- Chat control: Telegram command interface to pause, resume, or inspect deals.
- Risk rules: Auto close or scale down deals at configured drawdown levels.
- Template deployment: Create bots from stored presets (e.g. Airtable / Notion).
- PnL logging: Push periodic performance snapshots to Sheets or Notion.

---

## 📦 Installation

In your n8n instance or custom Docker setup:

    npm install n8n-nodes-gainium

Then restart your n8n server.

> This is a community node. You’ll need to enable community nodes in your `n8n` settings.

---

## 🔐 Authentication

Set your Gainium API Key in the credentials section of the node. You can create an API key in your Gainium account settings.

---

## **🧩 Operations**

The node groups operations by **Resource** (Bot, Deal, User, General). Where an action applies to
multiple bot/deal types, pick the type from a **Bot Type** / **Deal Type** dropdown instead of choosing
a separate node — e.g. one **List Bots** operation with a Grid/DCA/Combo selector.

### **Bot**

- **List Bots** — paginated list by type (Grid / DCA / Combo)
- **Start Bot**, **Stop Bot**, **Archive Bot**, **Restore Bot**
- **Clone Bot**
- **Update Bot** — DCA / Combo (Grid bots can't be updated)
- **Change Bot Pairs** — add / remove / replace trading pairs

### **Deal**

- **List Deals** — paginated list by type (DCA / Combo / Terminal), optional bot filter
- **Update Deal**
- **Start Deal** — open a new deal on a bot
- **Close Deal** — close by market or cancel
- **Manage Funds** — add or reduce funds on a deal

### **User**

- **List Exchanges** — connected exchange accounts
- **List Balances** — balances across exchanges

### **General**

- **Crypto Screener** — query the screener (page, sort, filter model)
- **Supported Exchanges**
- **Custom API Call** — make an arbitrary signed call to any Gainium endpoint

### Paper vs live

Account-scoped operations (Bot, Deal, User) expose a **Paper Trading** toggle. Turn it on to operate on
your paper (demo) account instead of live.

---

## 🗂️ Versioning

This is a **versioned node**, so existing workflows keep working when you update:

- **v2** (default) targets the Gainium **API v2** (`/api/v2/...`) with the grouped operations above.
- **v1** (legacy) targets the original `/api/*` endpoints. Workflows built on v1 stay on v1 untouched;
  new nodes default to v2.

---

## **🧠 Agent Tool**

Provides a unified action/data interface for AI or rule-driven agents (OpenAI, Anthropic, LangChain, etc.) so they can inspect state and invoke supported bot or deal operations dynamically.

---

## 💡 Example Workflows

1. TradingView signal → start bot via webhook
2. De-risk on BTC dominance spike
3. Profit alert when deal closes > X%
4. Screener match → create / notify
5. AI agent adjusts risk or pauses bots
6. Natural language command interface (Telegram / Slack)
7. Adaptive parameter tuning (volatility & volume)

---

## 🙋 Support

Need help or a feature? Open an issue or visit the [community forum](https://community.gainium.io).