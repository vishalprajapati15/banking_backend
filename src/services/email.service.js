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
