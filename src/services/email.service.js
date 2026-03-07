import 'dotenv/config';
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Error setting up email transporter: ", error);
    }
    else {
        console.log("Email transporter is ready to send emails!!");
    }
});

export const sendEmail = async(to, subject, text) =>{
    try {
        const info = await transporter.sendMail({
            from: `"Banking App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log("Email sent successfully: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); 
    } catch (error) {
        console.log("Error sending email: ", error);
    }
} 