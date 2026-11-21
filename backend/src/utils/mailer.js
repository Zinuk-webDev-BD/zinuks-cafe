const nodemailer = require("nodemailer");

const fromName = process.env.EMAIL_FROM_NAME || "Zinuk's Cafe Corner";
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!to) return;

  // Brevo (HTTP API). Needed later at deploy time because some hosts block SMTP.
  // Ignore this part for now. It only runs if BREVO_API_KEY is set.
  if (process.env.BREVO_API_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: process.env.BREVO_SENDER || process.env.EMAIL_USER,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
    return;
  }

  // Gmail (SMTP)
  const t = getTransporter();
  if (!t) {
    console.log(`[email skipped] "${subject}" to ${to} (set EMAIL_USER and EMAIL_PASS)`);
    return;
  }
  await t.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// Fire and forget: a failed email must never break an order
function sendMailSafe(options) {
  sendMail(options)
    .then(() => console.log(`Email sent: "${options.subject}" to ${options.to}`))
    .catch((err) => console.error("Email failed:", err.message));
}

module.exports = { sendMail, sendMailSafe };