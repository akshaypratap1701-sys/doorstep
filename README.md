# Doorstep

**Every failed delivery gets a second chance tonight.**

Doorstep is a seller desk for Indian D2C brands. A store uploads its orders and its courier's failed-delivery (NDR) report, and an AI agent talks to each buyer in Hindi, Hinglish or English to:

- rebook the delivery on a day that suits the buyer, with notes for the rider
- fix incomplete addresses (house number, landmark) and send them to the courier
- move cash-on-delivery buyers to UPI when cash is the problem
- flag likely fake delivery attempts ("nobody came to my door")
- accept the return when the buyer no longer wants it
- hand tricky cases (damage, refunds, upset buyers) to the store owner

By morning the owner sees what is back on the road, what came back and what needs them.

## Why

- 20 to 40% of first delivery attempts fail in Indian e-commerce, depending on category.
- Cash-on-delivery orders come back about 13 times more often than prepaid ones (about 26% vs under 2%).
- Each return costs another 60 to 80% of the forward shipping fee.

Most of these failures come down to a conversation that did not happen at the right moment.

## Try it

- **Demo store:** on the login screen, choose "Explore a demo store". No sign-up, no files.
- **Your own store:** register, then upload two CSVs. Templates are in [`sample/`](sample/) and on the upload screen.

Data is saved in your browser (localStorage). Nothing is sent to a server except the agent's prompts, and only when live AI is switched on.

## Live AI

Out of the box the hosted app uses scripted sample replies for the demo buyers. To let the agent think for real:

1. In Vercel, open the project's **Settings → Environment Variables**.
2. Add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`, default `claude-haiku-4-5`).
3. Redeploy.

The key stays on the server in [`api/agent.js`](api/agent.js), which has a basic per-IP rate limit.

## What is mocked

- **WhatsApp:** not connected yet. In test mode you, or the AI, play the buyer.
- **Courier API:** re-attempts, address edits, returns and escalations are shown in the shape a courier API expects, but are not sent anywhere.
- **Live courier connection:** shown as "Coming soon".

## Stack

A single `index.html` (vanilla JS, no build step) plus one Vercel serverless function. Deploy with `vercel` or by importing the repo in Vercel.

Built by Akshay Pratap Singh.
