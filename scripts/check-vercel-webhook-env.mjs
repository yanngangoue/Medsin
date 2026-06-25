console.log(
  JSON.stringify({
    STRIPE_IPE_WEBHOOK_SECRET: process.env.STRIPE_IPE_WEBHOOK_SECRET ? "SET" : "ABSENT",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "SET" : "ABSENT",
  }),
);
