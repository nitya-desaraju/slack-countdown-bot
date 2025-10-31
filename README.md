# Countdown Bot

This is Countdown Bot, a slack bot that displays how much time is left until Parthenon! It responds to /countdown and it posts a daily reminder message as well as a commencement message a 11/14 at 8pm est. It can be used in the-big-apple!

## How this works

It's a simple slack bot that is hosted on Render and uses Cron Jobs to send automated messages at specified times and send pings to Render to keep the bot awake.

## Challenges

I got a lot of errors on Render that wouldn't let /countdown work and resulted in a "dispatch_failed" error. Honestly, I'm not even sure how I fixed it; I fiddled with the environment and code until it suddenly worked. I also had the issue of render going inactive since I had the free version, which would result in a timeout error with /countdown because render would take at least 30 seconds to start. I fixed this by adding a new Cron Job to ping render. I learned how to read console logs in order to debug and what Cron Jobs are.

[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)