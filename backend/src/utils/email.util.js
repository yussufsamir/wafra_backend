import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to, code) => {
  await resend.emails.send({
    from: "Wafra <onboarding@resend.dev>",
    to: [to],
    subject: "Verify your Wafra account",
    html: `
      <h2>Welcome to Wafra!</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:8px">${code}</h1>
      <p>This code expires in 15 minutes.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (to, code) => {
  await resend.emails.send({
    from: "Wafra <onboarding@resend.dev>",
    to: [to],
    subject: "Reset your Wafra password",
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="letter-spacing:8px">${code}</h1>
      <p>This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
};
