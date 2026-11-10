import dotenv from 'dotenv';
import nodemailer from "nodemailer";


const result = dotenv.config({path: '../../../.env'});

const brevo_api_key = process.env.BREVO_API_KEY;
const gmail_app_pass = process.env.GMAIL_APP_PASS;
const auth_url = process.env.AUTHENTICATION_URL;
const mail_from = process.env.MAIL_FROM || 'campuslinkteam@gmail.com';

/**
 * Sends an email through the first configured method:
 *  1. Brevo's HTTPS API (BREVO_API_KEY) - used in production, since hosts like Railway block outbound SMTP,
 *  2. Gmail SMTP (GMAIL_APP_PASS) - handy locally,
 *  3. neither (local development, CI): the link is printed to the server log instead.
 * Returns 1 on success, -1 otherwise.
 */
async function sendMail(to, subject, html, link){
    try {
        if (brevo_api_key) {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: { 'api-key': brevo_api_key, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    sender: { name: 'CampusLink Team', email: mail_from },
                    to: [{ email: to }],
                    subject,
                    htmlContent: html,
                }),
                signal: AbortSignal.timeout(10000),
            });
            if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${await res.text()}`);
            console.log(`Email sent to ${to} via Brevo`);
            return 1;
        }

        if (gmail_app_pass) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: mail_from, pass: gmail_app_pass }
            });
            const info = await transporter.sendMail({ from: `"CampusLink Team" <${mail_from}>`, to, subject, html });
            console.log('Email sent: ' + info.response);
            return 1;
        }

        console.log(`[email not configured] Link for ${to}: ${link}`);
        return -1;
    } catch (error) {
        console.error('Error sending email:', error);
        return -1;
    }
}


/**
 * This function sends a verification link to the specified email. The link contains the /verify route, and is passed a verification token as a query parameter.
 * @param {*} email the email of the user the verification link will be sent to.
 * @param {*} verif_token the verification token used to identify the user being verified.
 * @param {*} valid_minutes how long the link stays valid (shown in the email).
 */
export async function sendVerificationLink(email, verif_token, valid_minutes = 10){

    const link = `${auth_url}/verify/confirm?token=${verif_token}`;

    return sendMail(email, 'Verify Your Account', `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Hello,</h2>
                <p>Thank you for signing up! To complete your registration, please verify your account by clicking the button below:</p>
                
                <p style="text-align: center;">
                    <a href="${link}"
                       style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Verify Account
                    </a>
                </p>
                
                <p>This link will expire in ${valid_minutes} minutes. If you did not sign up, please ignore this email.</p>
                
                <p>Best regards,<br>CampusLink Team</p>
    
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>If you have any issues or questions, feel free to reach out to us at <a href="mailto:${mail_from}">${mail_from}</a>.</p>
                </footer>
            </div>
        `, link);
}




/**
 * This function sends a password reset link to the specified email. The link contains the /passreset route, and is passed a passreset token as a query parameter.
 * @param {*} email the email of the user the verification link will be sent to.
 * @param {*} passreset_token the verification token used to identify the user being verified.
 */
export async function sendPassResetLink(email, passreset_token){

    const link = `${auth_url}/passreset?token=${passreset_token}`;

    return sendMail(email, 'Reset Your CampusLink Password', `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Hello,</h2>
                <p>A request to reset your CampusLink password has been made. To reset your password, please click the button below:</p>
                
                <p style="text-align: center;">
                    <a href="${link}"
                       style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Reset Password
                    </a>
                </p>
                
                <p>This link will expire in 1 hour. If you did not request password reset, please ignore this email.</p>
                
                <p>Best regards,<br>CampusLink Team</p>
    
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>If you have any issues or questions, feel free to reach out to us at <a href="mailto:${mail_from}">${mail_from}</a>.</p>
                </footer>
            </div>
        `, link);
}