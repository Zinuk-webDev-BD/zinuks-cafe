require("dotenv").config();
const { sendMail } = require("./src/utils/mailer");
const {
  orderPlacedEmail,
  statusEmail,
} = require("./src/utils/emailTemplates");

const to = process.argv[2];
if (!to) {
  console.log("Usage: node testMail.js your@email.com");
  process.exit(1);
}

const order = {
  _id: "test",
  orderNumber: "ZC-TEST123",
  status: "delivered",
  items: [
    {
      quantity: 2,
      name: "Caffe Latte",
      variant: "Large",
      addOns: [{ name: "Extra shot" }],
      lineTotal: 600,
    },
    { quantity: 1, name: "Chocolate Brownie", variant: "", addOns: [], lineTotal: 160 },
  ],
  subtotal: 760,
  discount: 76,
  couponCode: "WELCOME10",
  deliveryFee: 60,
  total: 744,
  address: {
    name: "Test Customer",
    phone: "01700000000",
    address: "House 12, Road 5, Dhanmondi, Dhaka",
    note: "Please call before arriving",
  },
};

(async () => {
  try {
    await sendMail({
      to,
      subject: "Test: Order ZC-TEST123 received",
      html: orderPlacedEmail(order, "http://localhost:3000/orders/test"),
    });
    const copy = statusEmail(order, "http://localhost:3000/orders/test");
    await sendMail({ to, ...copy });
    console.log("Sent 2 test emails to", to, "(check Inbox and Spam)");
  } catch (err) {
    console.error("Failed:", err.message);
  }
})();