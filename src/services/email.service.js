import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
    try {
        const data = await resend.emails.send({
            from: `"Banking App" <onboarding@resend.dev>`,
            to: [to],
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Email sent successfully!!: ", data);
    } catch (error) {
        console.log("Error sending email: ", error);
        throw new Error("Failed to send email!!");
    }
};

export const sendRegistrationEmail = async (userEmail, userName) => {
    const subject = "Welcome to Banking App!";

    const text = `Hi ${userName},\n\nThank you for registering with our Banking App! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nBanking App Team`;

    const html = `<p>Hi ${userName},</p><p>Thank you for registering with our <strong>Banking App</strong>! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br/>Banking App Team</p>`;

    await sendEmail(userEmail, subject, text, html);
};

export const sendTransactionEmail = async (userEmail, userName, amount, transactionType, toAccount) => {
    const subject = `Your recent ${transactionType} transaction of amount ${amount}`;

    const text = `Hi ${userName},

This is to inform you that a ${transactionType} transaction of amount ${amount} has been processed on your account.

Receiver Account: ${toAccount}

If you did not authorize this transaction, please contact our support team immediately.

Best regards,
Banking App Team`;

    const html = `
  <p>Hi ${userName},</p>

  <p>
    This is to inform you that a <strong>${transactionType}</strong> transaction of amount 
    <strong>${amount}</strong> has been processed on your account.
  </p>

  <p>
    <strong>Receiver Account:</strong> ${toAccount}
  </p>

  <p>
    If you did not authorize this transaction, please contact our support team immediately.
  </p>

  <p>Best regards,<br/>Banking App Team</p>
  `;

    await sendEmail(userEmail, subject, text, html);
}

export const sendTransactionFailureEmail = async (userEmail, userName, amount, transactionType, toAccount) => {
    const subject = `Failed ${transactionType} transaction of amount ${amount}`;

    const text = `Hi ${userName},

We wanted to inform you that a recent attempt to ${transactionType} an amount of ${amount} to account ${toAccount} was unsuccessful.

If you have any questions or need assistance, please contact our support team.

Best regards,
Banking App Team`;

    const html = `
  <p>Hi ${userName},</p>

  <p>
    We wanted to inform you that a recent attempt to 
    <strong>${transactionType}</strong> an amount of 
    <strong>${amount}</strong> to account 
    <strong>${toAccount}</strong> was unsuccessful.
  </p>

  <p>
    If you have any questions or need assistance, please contact our support team.
  </p>

  <p>Best regards,<br/>Banking App Team</p>
  `;
    await sendEmail(userEmail, subject, text, html);
}  
