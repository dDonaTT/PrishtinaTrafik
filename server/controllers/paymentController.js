const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const frontendUrl = process.env.FRONTEND_URL || 
                        (process.env.NODE_ENV === 'production' 
                          ? 'https://prishtinatrafik.vercel.app' 
                          : 'http://localhost:5173');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Wallet Top-Up",
              description: `Shto €${amount} në portofol`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: req.user.id.toString(),
        amount: amount.toString(),
      },
      success_url: `${frontendUrl}/wallet?success=true`,
      cancel_url: `${frontendUrl}/wallet?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCheckoutSession };