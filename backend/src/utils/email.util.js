import postmark from "postmark";

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const from = process.env.POSTMARK_FROM_EMAIL;

export const sendVerificationEmail = async (to, code) => {
  await client.sendEmail({
    From: from,
    To: to,
    Subject: "Verify your Wafra account",
    HtmlBody: `
      <h2>Welcome to Wafra!</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:8px">${code}</h1>
      <p>This code expires in 15 minutes.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (to, code) => {
  await client.sendEmail({
    From: from,
    To: to,
    Subject: "Reset your Wafra password",
    HtmlBody: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="letter-spacing:8px">${code}</h1>
      <p>This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
};
