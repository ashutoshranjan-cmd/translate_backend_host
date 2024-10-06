const Stripe = require('stripe')
const stripe = Stripe('sk_test_51PbRzn2NvV01L85tdwTXHS1mYMjfMlaWz3IE1IxdvFbLzKZTODYfJu1xSywse4vHvxI0MCPnl0Ao3chTdIlF0QVA00lRS8Kcnp')
const payment = async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      const lineItems = [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Custom Product",
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ];
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "https://indiaesevakendra.in/payment-success/",
        cancel_url: "https://support.paysimple.com/s/article/How-To-Refund-and-Void-a-Payment-in-Point-of-Sale",
      });
  
      res.json({ id: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while processing the payment." });
    }
  };

module.exports = {payment}