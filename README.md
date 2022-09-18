# tinder-GPT3

This repo is part of an experiment I did for my Youtube channel: What would happen if an AI would talk for me on Tinder? Would anyone notice?

If you want to see how it works and the conversation the bot had the videos link is:

Enjoy! 🤟

Stack used:

- Written in NodeJS
- Puppeteer to control your Chrome tab (And your tinder opened in it)
- OpenAI's GPT3 Api
- A LOT of hacks

This code might be broken in few month as it heavily depends on Tinder's UI that might change anytime. Also, Tinder'UI is extremely unstable and buggy, there will be dragons my friends.

Use it at your own risk, please always be kind with people you use this code with !

# How to use

- Run `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')`
- This will open a google chrome page and give you a websocket endpoint
- Duplicate `.env.example` to `.env` and complete it. Add the websocket endpoint in it.
- In the google chrome tab, open `tinder.com` and connect your tinder account (you'll have to complete the 2FA steps)
- Run `node index.js`
- Enjoy 😌

All the conversations are stored into JSON files, so you cna keep a trace of everything happening!
