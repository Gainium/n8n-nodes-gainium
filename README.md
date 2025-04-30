# n8n-nodes-gainium

Automate your crypto trading strategies with Gainium using n8n – the powerful workflow automation tool. The `n8n-nodes-gainium` package allows you to connect, trigger, and control your **crypto trading bots**, manage strategies, monitor deals, and more – all from inside n8n.

## ⚡ What is Gainium?

[Gainium](https://gainium.io) is a platform for **automated crypto trading**. It supports powerful features such as:

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

- Auto-start DCA or grid bots based on **TradingView signals**
- Pause bots when **market volatility increases**
- Pull data from your bots to Google Sheets or Notion
- Automate **risk reduction** when conditions are met
- Build advanced logic using **indicators, signals, and price feeds**

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

## 🧱 Nodes Included

- **Gainium Trigger** – Respond to webhooks or bot events
- **Gainium Bot Action** – Start/Stop/Pause/Resume bots
- **Gainium Deal Monitor** – Get current deal status
- **Gainium Account Data** – Retrieve portfolio and performance info
- **Gainium Custom Webhook** – Trigger external workflows

More coming soon.

---

## 💡 Example Workflows

1. **TradingView to Bot**  
   Use a webhook in n8n to catch a signal from TradingView, then start a Combo bot.

2. **Auto Reduce Risk**  
   Monitor BTC dominance with a third-party API. If it spikes, pause all bots or reduce open positions using Gainium Bot Action node.

3. **Telegram Profit Alerts**  
   Send a message when a deal closes with over 5% profit using the Deal Monitor node + Telegram node.

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

## 📝 License

MIT

---

## 🧠 Keywords

**crypto automation**, **automated trading**, **n8n crypto bots**, **trading bot automation**, **crypto trading bots**, **Gainium integration**, **grid bot automation**, **DCA bot automation**, **combo bot strategy**, **n8n gainium plugin**, **webhook crypto bot**, **algo trading n8n**, **automated crypto signals**, **n8n crypto integration**, **risk management crypto bots**, **auto-compounding trading bot**, **crypto trading workflow**
