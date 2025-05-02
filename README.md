# n8n-nodes-gainium

Automate your crypto trading strategies with Gainium using n8n – the powerful workflow automation tool. The `n8n-nodes-gainium` package allows you to connect, trigger, and control your **crypto trading bots**, manage strategies, monitor deals, and more – all from inside n8n.

## ⚡ What is Gainium?

[Gainium](https://gainium.io) is a **no-code automated crypto trading platform**. It supports powerful features such as:

- Smart trading terminal
- Grid bots, DCA bots, and Combo bots
- Advanced backtesting and paper trading
- Real-time market screener
- Portfolio tracking
- Risk reduction and auto-compounding
- Webhook-triggered bot actions

## 🤖 What is n8n?

[n8n](https://n8n.io) is a **workflow automation** tool that connects apps, APIs, and services. With this integration, you can build **automated crypto trading workflows**, connect your bots to alerts, signals, or analytics tools, and scale your trading systems without writing code.

---

## 🚀 Features of n8n-nodes-gainium

This custom node package for n8n lets you:

- ✅ **Trigger trading bots** on signals or events
- 📉 **Monitor open deals**, positions, and PnL
- ⚙️ **Control bot actions** (pause, resume, close deal, reduce position)
- 📡 **Receive strategy alerts** and automate responses
- 📊 **Get account and performance data** in real-time
- 🔁 Combine with other nodes (Telegram, Discord, TradingView) for **end-to-end crypto automation**

---

## 🔧 Use Cases

Take your crypto automation further by combining Gainium with other apps and logic inside n8n:

- **Portfolio Rebalancing Automation**
  Use market data from CoinGecko or your exchange to detect imbalances in your portfolio, then trigger fund movement across bots via Gainium API nodes.

- **Automated Risk Reduction on News Events**  
   Pull headlines from a news API. If negative sentiment is detected (e.g. using OpenAI or Google NLP), reduce exposure by pausing bots or reducing funds in active deals.
- **Smart Profit Scheduling**
  Use a time-based trigger (cron) to reduce position size weekly, or increase bot aggressiveness during high-volume times.
- **Dynamic Bot Settings Based on Volatility**
  Use a volatility indicator from an analytics service to dynamically adjust bot parameters like grid step, DCA scale, or max active deals via Gainium nodes.
- **Multi-Exchange Arbitrage Alerting**
  Compare symbol prices across exchanges using Gainium + external APIs, and alert or trigger a deal if arbitrage opportunities are found.
- **Telegram Bot for Manual Controls**
  Create a Telegram chatbot using n8n that lets you start/stop bots, view deal status, or pause all activity with simple text commands.
- **Custom Risk Management Layer**
  Monitor your deal performance and close or scale down deals when they hit certain drawdown thresholds using Gainium’s deal management endpoints.
- **Automated Bot Deployment from Strategy Templates**
  Store strategy templates in Airtable or Notion. When conditions are met, create new bots with preconfigured settings using Gainium’s bot creation node.
- **Sync Gains to Notion or Google Sheets**
  Pull account and bot PnL data on a schedule and log it into Notion or Sheets for tracking, analysis, or client reporting.

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

## **🧩 Nodes Included**

Each Gainium API endpoint has its own dedicated n8n node for maximum flexibility in your workflows.

### **Bots**

- Get Grid Bots — /api/bots/grid
- Get Combo Bots — /api/bots/combo
- Get DCA Bots — /api/bots/dca
- Update DCA Bot — /api/updateDCABot
- Update Combo Bot — /api/updateComboBot
- Change Bot Pairs — /api/changeBotPairs
- Start Bot — /api/startBot
- Restore Bot — /api/restoreBot
- Stop Bot — /api/stopBot
- Archive Bot — /api/archiveBot

### **Deals**

- Get Deals — /api/deals
- Update DCA Deal — /api/updateDCADel
- Update Combo Deal — /api/updateComboDeal
- Add Funds to Deal — /api/addFunds
- Reduce Funds from Deal — /api/reduceFunds
- Start Deal — /api/startDeal
- Close Deal — /api/closeDeal/{dealId}

### **General**

- Get Supported Exchanges — /api/exchanges

More coming soon.

---

## **🧠 Gainium Agent Tool**

The Gainium Agent Tool is a special-purpose node designed for AI agents in n8n.

It allows agents—like those built using OpenAI or Anthropic —to dynamically decide what actions to take and pull data from your Gainium account in real time.

This enables next-level automation where AI can act as your trading assistant, making decisions based on logic, data, and goals—not just static flows.

---

## 💡 Example Workflows

1. **TradingView to Bot**  
   Use a webhook in n8n to catch a signal from TradingView, then start a Combo bot.

2. **Auto Reduce Risk**  
   Monitor BTC dominance with a third-party API. If it spikes, pause all bots or reduce open positions using Gainium Bot Action node.

3. **Telegram Profit Alerts**  
   Send a message when a deal closes with over 5% profit using the Deal Monitor node + Telegram node.

4. **AI Agent as Trading Assistant**
   Connect an OpenAI agent to Gainium using the Agent Tool node. Let the agent fetch live deal data and decide whether to reduce risk, pause bots, or rebalance positions.
5. **Natural Language Bot Control**
   Let users type plain English into Telegram or Slack (e.g. “Pause all BTC bots”). An agent interprets the message and triggers the correct Gainium action node.
6. **Adaptive Strategy Execution**
   Use a LangChain agent to monitor volatility and volume metrics from multiple sources. Based on the data, it can update bot settings like DCA scale or grid step size dynamically.

---

## 🙋 Support

Need help or feature requests?  
Open an issue here or connect via the [Gainium Community](https://community.gainium.io).

---

## 🧑‍💻 Contributing

1. Fork this repo
2. Make your changes
3. Submit a PR

Let’s build better automation for crypto traders together.

---

## 🧠 Keywords

**crypto automation**, **automated trading**, **n8n crypto bots**, **trading bot automation**, **crypto trading bots**, **Gainium integration**, **grid bot automation**, **DCA bot automation**, **combo bot strategy**, **n8n gainium plugin**, **webhook crypto bot**, **algo trading n8n**, **automated crypto signals**, **n8n crypto integration**, **risk management crypto bots**, **auto-compounding trading bot**, **crypto trading workflow**
