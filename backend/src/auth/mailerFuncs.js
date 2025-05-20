import dotenv from 'dotenv';
import nodemailer from "nodemailer";


const result = dotenv.config({path: '../../../.env'});

const gmail_app_pass = process.env.GMAIL_APP_PASS;
const auth_url = process.env.AUTHENTICATION_URL;


/**
 * This function sends a verification link to the specified email. The link contains the /verify route, and is passed a verification token as a query parameter.
 * @param {*} email the email of the user the verification link will be sent to.
 * @param {*} verif_token the verification token used to identify the user being verified.
 */
export async function sendVerificationLink(email, verif_token){

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'campuslinkteam@gmail.com',
            pass: `${gmail_app_pass}`
        }
    });

    
    const verificationLink = `${auth_url}/verify/confirm?token=${verif_token}`;

    const mailOptions = {
        from: '"CampusLink Team" <campuslinkteam@gmail.com>',
        to: email,
        subject: 'Verify Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Hello,</h2>
                <p>Thank you for signing up! To complete your registration, please verify your account by clicking the button below:</p>
                
                <p>Verification Token: ${verif_token} </p>
                
                <p>This link will expire in 1 hour. If you did not sign up, please ignore this email.</p>
                
                <p>Best regards,<br>CampusLink Team</p>
    
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>If you have any issues or questions, feel free to reach out to us at <a href="mailto:support@campuslink.com">support@campuslink.com</a>.</p>
                </footer>
            </div>
        `
    };
    
    

    try {
        // Send email and await the result
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 1;  // Return success
    } catch (error) {
        console.error('Error sending email:', error);
        return -1;  // Return error code
    }

}




/**
 * This function sends a password reset link to the specified email. The link contains the /passreset route, and is passed a passreset token as a query parameter.
 * @param {*} email the email of the user the verification link will be sent to.
 * @param {*} passreset_token the verification token used to identify the user being verified.
 */
export async function sendPassResetLink(email, passreset_token){

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'campuslinkteam@gmail.com',
            pass: `${gmail_app_pass}`
        }
    });


    const mailOptions = {
        from: 'campuslinkteam@gmail.com',
        to: email,
        subject: 'Verify Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Hello,</h2>
                <p>A request to reset your CampusLink password has been made. To reset your password, please click the button below:</p>
                
                <p style="text-align: center;">
                    <a href="${auth_url}/verify?token=${passreset_token}" 
                       style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Reset Password
                    </a>
                </p>
                
                <p>This link will expire in 1 hour. If you did not request password reset, please ignore this email.</p>
                
                <p>Best regards,<br>CampusLink Team</p>
    
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>If you have any issues or questions, feel free to reach out to us at <a href="mailto:support@campuslink.com">support@campuslink.com</a>.</p>
                </footer>
            </div>
        `
    };
    
    

    try {
        // Send email and await the result
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 1;  // Return success
    } catch (error) {
        console.error('Error sending email:', error);
        return -1;  // Return error code
    }

}