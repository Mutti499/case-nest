# Welcome to my code for beije case!

In this code I have written a system which creates User, adds new Address to user and collects shopping cart data and prepares orders for users with a one-time or subscription system.

To make monthly orders cron has been used. Every day, customers' subscriptions are checked and orders are given according to the subscriptions that are due.
When the subscription expires, the person's subscription is deleted.

You can find necessary documents in user.controller.ts and user.service.ts
