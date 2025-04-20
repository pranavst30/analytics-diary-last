import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createMailOptions = (toEmail) => ({
  from: "Analytics Diary <pranavtavarej@gmail.com>",
  to: toEmail,
  subject: "📔 Your Analytics Diary is ready for today's entry!",
  text: `Good afternoon!

It's a fresh start — the perfect time to reflect, plan, and track your progress. Your Analytics Diary is ready for today's entry.

Start writing now 👉 https://diary-analy.vercel.app/

Why log your day?
• Stay consistent with your habits
• Track your productivity & mindset
• Build self-awareness over time

Just a few minutes each day can make a big difference. 💪

Let’s make today meaningful — you’ve got this!

Cheers,
The Analytics Diary Team
`,
  html: `
    <p>Good afternoon!</p>
    <p>It’s a fresh start — the perfect time to reflect, plan, and track your progress. Your Analytics Diary is ready for today’s entry.</p>

    <p>🖊 <strong>Start writing now:</strong><br>
    👉 <a href="https://diary-analy.vercel.app/" target="_blank">Log Today’s Entry</a></p>

    <h3>Why log your day?</h3>
    <ul>
      <li>Stay consistent with your habits</li>
      <li>Track your productivity & mindset</li>
      <li>Build self-awareness over time</li>
    </ul>

    <p>Just a few minutes each day can make a big difference. 💪</p>

    <p>Let’s make today meaningful — you’ve got this!</p>

    <p>Cheers,<br>
    The Analytics Diary Team</p>
  `,
});

export default async function handler(req, res) {
  try {
    const users = await prisma.user.findMany();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    for (const user of users) {
      const mailOptions = createMailOptions(user.email);
      await transporter.sendMail(mailOptions);
      console.log(`📩 Email sent to ${user.email}`);
    }

    return res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    return res.status(500).json({ error: "Error sending emails" });
  } finally {
    await prisma.$disconnect();
  }
}
