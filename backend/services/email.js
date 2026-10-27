async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    const error = new Error('Email delivery is not configured. Add RESEND_API_KEY and MAIL_FROM.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned status ${response.status}.`);
  }
}

module.exports = sendEmail;
