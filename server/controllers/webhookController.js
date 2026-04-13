const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const user_id = session.metadata.user_id;
    const amount = parseFloat(session.metadata.amount);

    try {
      let wallet = await Wallet.findByUserId(user_id);
      if (!wallet) await Wallet.create(user_id);
      await Wallet.topUp(user_id, amount);

      await Transaction.create({
        user_id,
        type: "top_up",
        amount,
        vehicle_id: null,
      });

      console.log(" Wallet updated:", user_id, amount);
    } catch (err) {
      console.error("DB error:", err);
    }
  }

  res.json({ received: true });
};

module.exports = { handleWebhook };
