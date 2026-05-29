import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"Wafra" <${process.env.EMAIL_USER}>`,
    to,
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
  await transporter.sendMail({
    from: `"Wafra" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Wafra password",
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="letter-spacing:8px">${code}</h1>
      <p>This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
};
