import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import zxcvbn from 'zxcvbn';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import cookieparser from 'cookie-parser';

import { deleteExpiredTokens, getUserFromDB, getUsernameFromPassResetToken, insertNewUser, insertVerifToken, insertPassResetToken, modifyUserPassword } from './dbfuncs_auth.js';
import { getClubFromDB } from './dbfuncs_auth.js';
import { sendVerificationLink, sendPassResetLink } from './mailerFuncs.js';
import { isValidAUBEmail, getUsername_from_email, isValidAUBClubCRN } from '../helperfuncs.js';

dotenv.config({path: '../../../.env'});

const router = express.Router();

const bytespertoken = 20; // 40 hex characters, long enough that tokens can't be guessed
const jwt_secretKey = process.env.JWT_SECRET;

/**
 * Options for the auth cookie. In production the frontend is served from the same
 * origin as the API, so a first-party 'lax' cookie works; it must be 'secure' over HTTPS.
 */
const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

/**
 * Tokens are hex strings; anything else is rejected before it reaches the database or an HTML page.
 */
function isValidToken(token){
    return typeof token === 'string' && /^[0-9a-f]{1,64}$/.test(token);
}

function isNonEmptyString(value){
    return typeof value === 'string' && value.length > 0;
}

//Middleware:
/*
router.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // This is important for sending cookies
}));
*/

router.use(express.json());
router.use(express.urlencoded({ extended: false })); // for the password reset HTML form
router.use(cookieparser());

/**
 * The salt rounds for the bcrypt password encryption algorithm.
 */
const saltRounds = 10;


//#region [Log-in Request Handler]
router.post(`/login-user`, async (req, res) => {


    const {email, password} = req.body;

    //CHECK IF EMAIL HAS RIGHT DOMAIN

    if (!email || email.length === 0 || !isValidAUBEmail(email)){
        res.status(400).json({success: false, message: "With respect from the server: Email must end with @mail.aub.edu"});
        return;
    }

    if (!isNonEmptyString(password)){
        res.status(400).json({success: false, message: "Password is required."});
        return;
    }

    const username = getUsername_from_email(email);

    //Need to check for username in database:

    const user_DB = await getUserFromDB(username);

    if (user_DB){

        //User must have verified his account:
        if (user_DB.verified == false){
            res.status(401).json({success: false, message: "Account not verified. Please check your inbox and verify your account."})
            return;
        }

        //Check if passwords match:

        const pass_Vald = await bcrypt.compare(password, user_DB.password_hash);

        if (!pass_Vald){
            res.status(401).json({success: false, message: "Invalid username or password"});
            return;
        }


        //Create the JWT object:
        const user_jwt_payload = {
            username: username,
            role: 'user',
            club_crn: ''
        };

        //Now, I need to sign the jwt:
        const user_jwt_signed = jwt.sign(user_jwt_payload, jwt_secretKey, {expiresIn: '1hr'});

        //Next, I need to store the token in cookies:
        res.cookie('authtoken', user_jwt_signed, { ...authCookieOptions, maxAge: 3600000 });


        res.status(200).json({success: true, message: "login successful"});
    
    }
    else {
        res.status(401).json({success: false, message: "Invalid username or password."});
        return;
    }

});
//#endregion


router.post(`/login-club`, async (req, res) => {

    const { email, user_password, club_crn, club_password } = req.body;
    /**
     * 1. Check username in database (DONE)
     * 2. Check user password (DONE)
     * 3. Check if user is verified (DONE)
     * 4. Check club crn in database (DONE)
     * 5. Check club password (DONE)
     * 6. Update the jwt (DONE)
     * 7. Add the club access to database
     */

    if (!email || email.length === 0 || !isValidAUBEmail(email)){
        res.status(400).json({success: false, message: "Invalid email address. Make sure email ends with @mail.aub.edu"});
        return;
    }

    if (!club_crn || club_crn.length === 0 || !isValidAUBClubCRN(club_crn)){
        res.status(400).json({success: false, message: "Invalid club CRN."});
        return;
    }

    if (!isNonEmptyString(user_password) || !isNonEmptyString(club_password)){
        res.status(400).json({success: false, message: "User password and club password are required."});
        return;
    }

    const username = getUsername_from_email(email);

    const user_DB = await getUserFromDB(username);

    if (user_DB){

        //User must have verified his account:
        if (user_DB.verified == false){
            res.status(401).json({success: false, message: "User not verified. Please check your inbox and verify your account."})
            return;
        }

        //Check if passwords match:

        const userpass_Vald = await bcrypt.compare(user_password, user_DB.password_hash);

        if (!userpass_Vald){
            res.status(401).json({success: false, message: "Invalid username or password"});
            return;
        }

        const club_DB = await getClubFromDB(club_crn);

        if (club_DB){

            const clubpass_Vald = await bcrypt.compare(club_password, club_DB.password_hash);

            if (!clubpass_Vald){
                res.status(401).json({success: false, message: "Invalid club CRN or password"});
                return;
            }

            //Create the JWT object:
            const user_jwt_payload = {
                username: username,
                role: 'cabinet',
                club_crn: club_crn
            };

            //Now, I need to sign the jwt:
            const user_jwt_signed = jwt.sign(user_jwt_payload, jwt_secretKey, {expiresIn: '1hr'});

            //Next, I need to store the token in cookies:
            res.cookie('authtoken', user_jwt_signed, { ...authCookieOptions, maxAge: 3600000 });


            res.status(200).json({success: true, message: "club login successful"});

        }
        else {
            res.status(401).json({success: false, message: "Invalid club CRN or password"});
            return;
        }

        
    
    }
    else {
        res.status(401).json({success: false, message: "Invalid username or password."});
        return;
    }

});


//#region [Sign-up Request Handler]
router.post(`/signup`, async (req, res) => {

    //Destruct request body to get email and password variables:
    const {email, password} = req.body;

    //Need to validate email address:

    //Validate AUB email:

    if (!email || email.length === 0 || !isValidAUBEmail(email)){
        res.status(400).json({success: false, message: "Email must end with @mail.aub.edu"});
        return;
    }

    if (!isNonEmptyString(password)){
        res.status(400).json({success: false, message: "Password is required."});
        return;
    }

    //Need to extract the username from the email:
    
    const username = getUsername_from_email(email);


    const user_DB = await getUserFromDB(username);

    if (user_DB){//If account already exists, then we must inform the user to log in instead.
        res.status(409).json({ 
            success: false,
            message: 'Cannot create account. User with given username already exists.',
            errorCode: 'ACCOUNT EXISTS'
        });
        return;
    }


    //need to await the hashing process before storing the password in the database:
    //Hash password:
    const hashedPass = await bcrypt.hash(password, saltRounds);


    //Now, before adding user to data base, we need to confirm that the right email was given.
    
    //But what if the same one-time token was generated for another user, so we have 2 users with the same verification token??
    //To fix this problem, we will use a cryptographically secure token:
    const verif_token = crypto.randomBytes(bytespertoken).toString('hex');


    //Adding the user to the database:
    const addUser_result = await insertNewUser(username, email, hashedPass);
    
    if (!addUser_result.success){
        return res.status(400).json(addUser_result);
    }
    console.log('User added to database successfully.');

    
    const emailSent = await sendVerificationLink(email, verif_token);
    //Need to add the verification token to the verifToken table:
    const insert_verifToken_result = await insertVerifToken(username, verif_token);

    res.json({ 
        success: true,
        message: 'Account created successfully. Please check your inbox for a verification link. If the email does not appear, please check your spam/junk folder.'
    });
    return;


});
//#endregion


//#region [Verification Request Handler]

router.get('/verify/confirm', (req, res) => {
    const token = req.query.token;

    if (!isValidToken(token)) {
        return res.status(400).send("<h1>Error</h1><p>Invalid verification request.</p>");
    }

    // Render a simple HTML page with a button that redirects to the actual verification
    res.send(`
        <html>
        <head>
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Confirm Your Email</h2>
            <p>Click the button below to verify your email:</p>
            <a href="${process.env.AUTHENTICATION_URL}/verify?token=${token}" 
               style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Confirm Verification
            </a>
        </body>
        </html>
    `);
});

router.get('/verify', async (req, res) => {
    
    //A token would be passed here. This token is stored in the database and is mapped to a specific username:
    /**
     *   1. Read token from query parameter.
     *   2. Use token to get username in database, then set the 'verified' field to true
     *   3. Set expiry date to null or something
     */

    const verif_token_string = req.query.token;

    if (!isValidToken(verif_token_string)){
        res.status(400).json({success: false, message: "Invalid verification token."});
        return;
    }

    const [row] = await db.execute('CALL GetUserFromVerifToken(?)',[verif_token_string]);

    const verif_username = (row[0][0])?row[0][0].username : null;

    if (!verif_username){
        res.status(404).json({success: false, message: "Something went wrong. Invalid verification token."});
        return;
    }

    //Here, everything went fine, so we update the user at index user-index to become verifiied:
    //users[user_index].verified = true;

    await db.execute('CALL VerifyUser(?)', [verif_username]);

    res.status(200).send('<h1>CampusLink Verification</h1> <p>User successfully verified.</p>');

});
//#endregion

//#region [Password Reset Handlers]

/**
 * Step 1: the user submits their email from the "Forgot password" page.
 * A reset token is stored (valid for 1 hour) and a link to /passreset is emailed.
 */
router.post('/requestpassreset', async (req, res) => {

    const { email } = req.body;

    if (!email || !isValidAUBEmail(email)){
        res.status(400).json({success: false, message: "Invalid email address. Make sure email ends with @mail.aub.edu"});
        return;
    }

    const username = getUsername_from_email(email);

    //Same answer whether or not the account exists, so this form can't be used to find out who has an account:
    const genericResponse = {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam/junk folder.'
    };

    const user_DB = await getUserFromDB(username);

    if (!user_DB){
        res.json(genericResponse);
        return;
    }

    //Generate the random passreset token, store it, then email the link:
    const passreset_token = crypto.randomBytes(bytespertoken).toString('hex');

    await insertPassResetToken(username, passreset_token);
    await sendPassResetLink(email, passreset_token);

    res.json(genericResponse);
    return;

});

/**
 * Step 2: the emailed link opens this page, which shows a form to choose a new password.
 */
router.get('/passreset', async (req, res) => {

    const token = req.query.token;

    if (!isValidToken(token) || !(await getUsernameFromPassResetToken(token))){
        res.status(404).send(passResetPage('<p>This password reset link is invalid or has expired. Please request a new one.</p>'));
        return;
    }

    res.send(passResetPage(`
        <p>Choose a new password for your CampusLink account.</p>
        <form method="POST" action="passreset">
            <input type="hidden" name="token" value="${token}">
            <input type="password" name="newpassword" placeholder="New password" required minlength="8"
                   style="padding: 10px; width: 260px; font-size: 16px;"><br><br>
            <button type="submit"
                    style="padding: 12px 20px; background-color: #007BFF; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                Reset Password
            </button>
        </form>
    `));

});

/**
 * Step 3: the form (or a JSON client) submits the token and the new password.
 */
router.post('/passreset', async (req, res) => {

    const { token, newpassword } = req.body;
    const wantsHtml = req.is('application/x-www-form-urlencoded');

    const fail = (status, message) => wantsHtml
        ? res.status(status).send(passResetPage(`<p>${message}</p>`))
        : res.status(status).json({success: false, message});

    if (!isValidToken(token)){
        return fail(400, "Invalid password reset token.");
    }

    //Same strength rule the sign-up form uses:
    if (!isNonEmptyString(newpassword) || newpassword.length < 8 || zxcvbn(newpassword).score < 3){
        return fail(400, "Password is too weak. Please go back and choose a longer, less predictable password.");
    }

    //Get the username from the token:
    const username = await getUsernameFromPassResetToken(token);

    if (!username){
        return fail(404, "This password reset link is invalid or has expired. Please request a new one.");
    }

    //Hash and store the new password (this also deletes the used token):
    const newpasshash = await bcrypt.hash(newpassword, saltRounds);
    const result = await modifyUserPassword(username, newpasshash);

    if (!result.success){
        return fail(500, "Something went wrong while resetting your password. Please try again.");
    }

    if (wantsHtml){
        res.status(200).send(passResetPage('<p>Your password has been reset. You can now log in with your new password.</p>'));
    }
    else {
        res.status(200).json({success: true, message: "Password reset successful."});
    }

});

function passResetPage(body){
    return `
        <html>
        <head><title>CampusLink Password Reset</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>CampusLink Password Reset</h2>
            ${body}
        </body>
        </html>
    `;
}

//#endregion


router.post('/logout', (req, res) => {

    res.clearCookie('authtoken', authCookieOptions);

    res.status(200).json({ success: true, message: "Logout successful" });
});

//#region [Check database for expired verification tokens]

const checkTokenDelay = 60000 * 60; //60 minutes

//Check expiration of verification tokens and remove expired tokens every interval.
setInterval(() => {

    deleteExpiredTokens();

}, checkTokenDelay);

//#endregion


export default router;

//app.listen(5000, '0.0.0.0', () => console.log(`Listening on port 5000...`));
