
import dotenv from 'dotenv';

//Imports related to server directory creation and storage:
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';

import { verifyAuthorizedCabinet, verifyJwtToken, verifyUserExists } from '../AuthorizationMiddleware.js';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import moment from 'moment';
import vision from '@google-cloud/vision';
import { addNewPost, clubTitle_other_exists, get_club_posts, get_club_profile, get_event_participants, update_club_profile } from './dbfuncs_cabinet.js';
import { isValidAUBClubCRN, isValidEmail } from '../helperfuncs.js';
import { checkprofanity } from '../../API Clients/NeutrinoAPI_requests.js';
import { compressUploadImage } from './compressUpload.js';

dotenv.config({path: '../../../.env'});

const router = express.Router();

router.use(cookieParser());

const vision_client = new vision.ImageAnnotatorClient({

    keyFile: '../../../' + process.env.GOOGLE_VISION_CREDENTIALS_PATH

});

//Making sure the upload directory exists whenever the server runs:
const uploadDir = path.join(__dirname, 'uploads');
const compressedUploadDir = path.join(__dirname, 'compressed');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ 'uploads' folder created.");
}
if (!fs.existsSync(compressedUploadDir)) {
    fs.mkdirSync(compressedUploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        
        if (!req.user){
            return cb(new Error("Cannot store post, user invalid."), null);
        }
        
        const username = req.user.username.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
        const uniqueFilename = `${username}_${Date.now()}`;
        cb(null, uniqueFilename);
    },
});

const upload = multer({ storage });

router.get('/get-club-profile', verifyJwtToken, verifyUserExists, async (req, res) => {

    const username = req.user.username;

    const club_crn = req.query.club_crn;

    if (!club_crn){
        res.status(404).json({success: false, message: 'Cannot get club profile: Invalid club CRN.'});
        return;
    }

    const profile_query_result = await get_club_profile(username, club_crn);

    res.status((profile_query_result.success)?200:404).json(profile_query_result);

})

/**
 * This is general user function, this loads the club posts for any user.
 */
router.get('/get-club-posts', verifyJwtToken, verifyUserExists, async (req, res) => {

    const club_crn = req.query.club_crn;

    if (!club_crn){
        return res.status(401).json({success: false, message: 'Cannot get club posts: Invalid club CRN'});
    }

    const posts_query_result = await get_club_posts(club_crn);

    res.status((posts_query_result.success)?200:404).json(posts_query_result);

});

router.get('/get-event-participants', verifyJwtToken, verifyAuthorizedCabinet, verifyUserExists, async (req, res) => {

    const event_id = req.query.event_id;

    if (!event_id){
        return res.status(401).json({success: false, message: 'Cannot get event participants: Invalid event id.'});
    }

    const participant_query_result = await get_event_participants(event_id);

    res.status((participant_query_result.success)?200:404).json({success: true, data: participant_query_result.participant_list});

});


router.post('/edit-club-details', verifyJwtToken, verifyAuthorizedCabinet, verifyUserExists, upload.single("profile_pic"), async (req, res) => {

    //Make sure the form is not empty:
    if (!req.body) return res.status(400).json({success: false, message: "Form is empty."})

    //No matter what club the user is trying to edit, it will always change his own club's profile (the one he's logged into):

    const { club_crn } = req.user;

    const { new_title, new_bio, new_email } = JSON.parse(req.body.new_profile);

    let new_profile_photo_url = null;
    if (req.file) {
        const inputPath = req.file.path;

        const compression_result = await compressUploadImage(inputPath, compressedUploadDir, req.file.filename, 500, 50);

        if (compression_result.success){        
            new_profile_photo_url = `${req.protocol}://${req.get('host')}/${compression_result.relpath}`;
        }
        else {
            return res.status(400).json(compression_result);
        }
    }

    

    const profile_validation = await validateProfileForm(club_crn, new_title, new_bio, new_email);

    if ( ! profile_validation.success){
        return res.status(400).json(profile_validation);
    }
    console.log(profile_validation);

    //Note: If anything is passed as null here (other than club_crn which can't be null) it won't be changed in the database.
    const db_result = await update_club_profile(club_crn, new_title, new_bio, new_email, new_profile_photo_url);


    if ( ! db_result.success) return res.status(400).json(db_result);

    return res.status(200).json({success: true, message: "Club profile successfully updated."});

});

const club_title_max_char = 255;
const club_title_min_char = 5;
const club_bio_max_char = 512;
const club_bio_min_char = 0;
const club_email_max_char = 255;

async function validateProfileForm(curr_club_crn, new_title, new_bio, new_email){  

    if ( ! new_title || new_title.length < club_title_min_char || new_title.length > club_title_max_char){
        return {success: false, message: `Cannot rename club. Title length must be at least ${club_title_min_char} characters short and at most ${club_title_max_char} characters long.`}
    }

    //Make sure no other club has the same title:
    const clubTitleExists_result = await clubTitle_other_exists(new_title, curr_club_crn);
    console.log("other? : ", clubTitleExists_result);
    if (clubTitleExists_result.success){
        if (clubTitleExists_result.value){
            return {success: false, message: "Cannot rename club. Another club with given name already exists."}
        }
    }
    else {
        return {success: false, message: clubTitleExists_result.message};
    }


    if (new_bio && (new_bio.length < club_bio_min_char || new_bio.length > club_bio_max_char)){
        return {success: false, message: `Club bio must be at least ${club_bio_min_char} characters short and at most ${club_bio_max_char} characters long.`}
    }

    if (new_email){
        if (new_email.length > club_email_max_char){
            return {success: false, message: `Club email must be at least ${club_bio_min_char} characters short and at most ${club_bio_max_char} characters long.`}
        }

        if (new_email.length > 0){
            if (!isValidEmail(new_email)){
                return {success: false, message: "Invalid email address."};
            }
        }
    }

    //TODO: Check uploaded image for inappropriate content.

    return {success: true};
}


const maxTitleLen = 100; //chars
const maxCaptionLen = 2000;
const minEventParticipation = 1;
const minTicketPrice = 0;
const maxTicketPrice = 150;

router.post('/createPost', verifyJwtToken, verifyAuthorizedCabinet, verifyUserExists, upload.single("post_image"), async (req, res) => {

    if (!req.body) return res.status(400).json({success: false, message: "Request body is null."});

    const { user } = req;

    const { username, club_crn} = user;

    
    //Read the post object from request body:
    const post_obj = JSON.parse(req.body.post_obj);

    if (!post_obj) return res.status(400).json({success: false, message: "Post object is null."}); 


    //Handle Image Compression:

    let post_image_url = null;
    if (req.file) {
        const inputPath = req.file.path;

        const compression_result = await compressUploadImage(inputPath, compressedUploadDir, req.file.filename);

        if (compression_result.success){        
            post_image_url = `${req.protocol}://${req.get('host')}/${compression_result.relpath}`;
        }
        else {
            return res.status(400).json(compression_result);
        }

    }
    

    //Add the image url to the post object:
    post_obj.post_image_url = (post_image_url)?post_image_url:'';

    const post_validity = await validatePostContent(post_obj);
    
    if (post_validity.success === false){
        res.status(404).json(post_validity);
        return;
    }

    

    const final_post_obj = {
        club_crn: club_crn,
        posted_by: username,
        post_details: (post_obj.post_details)? post_obj.post_details : null,
        post_image_url: (post_obj.post_image_url)? post_obj.post_image_url : null,
        post_title: (post_obj.post_title)? post_obj.post_title : null,
        is_event: (post_obj.is_event)? post_obj.is_event : 0,
        event_title: (post_obj.event_title)? post_obj.event_title : null,
        event_details: (post_obj.event_details)? post_obj.event_details : null,
        event_exclusive:(post_obj.event_exclusive)? post_obj.event_exclusive : 0,
        event_date: (post_obj.event_date)? post_obj.event_date : null,
        event_startTime: (post_obj.event_startTime)? post_obj.event_startTime : null,
        event_endTime: (post_obj.event_endTime)? post_obj.event_endTime : null,
        event_location_name: (post_obj.event_location_name)? post_obj.event_location_name : null,
        event_location_latitude: (post_obj.event_location_latitude)? post_obj.event_location_latitude : null,
        event_location_longitude: (post_obj.event_location_longitude)? post_obj.event_location_longitude : null,
        event_max_participation: (post_obj.event_max_participation)? post_obj.event_max_participation : minEventParticipation,
        event_ticket_price: (post_obj.event_ticket_price)? post_obj.event_ticket_price : minTicketPrice,
    }

    const db_insert_result = await addNewPost(final_post_obj);

    if (db_insert_result.success === false){

        res.status(404).json(db_insert_result);
        return;

    }

    res.status(200).json({success: true, message: 'Post created successfully.'});
    return;
    
});


async function validatePostContent(post_obj){

    //First, I must check if title has a valid length:

    const { post_title, post_details, is_event, event_title, event_details, event_date, event_location, event_max_participation, event_ticket_price, event_exclusive } = post_obj;

    if (post_title){
        
        if (post_title.length == 0){
            return { success: false, message: `Invalide post title length. Title length cannot be zero.` };
        }
        else if (post_title.length > maxTitleLen){
            return {success: false, message: `Invalid post title length. Title length cannot exceed ${maxTitleLen}.`};
        }

        //Check if title contains profane language:
        if ( await isSafeText(post_title) === false){
            return {success: false, message: `Your post title contains language that goes against our community guidelines. Please review and revise your title before submitting.`};
        }

    }
    else {
        return {success: false, message: `Invalid post title. Title is undefined.`};
    }

    if (post_details){
        
        if (post_details.length > maxCaptionLen){
            return {success: false, message: `Invalid post caption length. Caption length cannot exceed ${maxCaptionLen}.`}
        }

        //Check if caption contains profane material:
        if ( await isSafeText(post_details) === false){
            return {success: false, message: `Your post caption contains language that goes against our community guidelines. Please review and revise your content before submitting.`};
        }

    }

    //If post is an event, check the validity of event content:
    if (is_event){
        if (event_title){
            if (event_title.length == 0){
                return { success: false, message: `Invalid event title length. Title length cannot be zero.` };
            }
            else if (event_title.length > maxTitleLen){
                return { success: false, message: `Invalid event title length. Title length cannot exceed ${maxTitleLen}.` };
            }

            //Check if event details contains profane material:
            if ( await isSafeText(event_title) === false){
                return {success: false, message: `Your event title contains language that goes against our community guidelines. Please review and revise your content before submitting.`};
            }
        }
        else {
            return {success: false, message: `Invalid event title. Event title is undefined.`};
        }

        if (event_details){
            if (event_details.length > maxCaptionLen){
                return { success: false, message: `Invalid event details length. Event details length cannot exceed ${maxCaptionLen}.` };
            }

            //Check if caption contains profane material:
            if (await isSafeText(event_details) === false){
                return {success: false, message: `Your event details contain language that goes against our community guidelines. Please review and revise your content before submitting.`};
            }
        }

        //Check if event date is a valid one:

        if (!event_date || !isValidDateStrict(event_date)){
            return { success: false, message: `Invalid event date.` };
        }

        //Check if event max participation is less than minimum allowed:
        if (event_max_participation < minEventParticipation){
            return {success: false, message: `Invalid event max-participation count.`}
        }

        //Check if ticket price is within allowed range:
        if (event_ticket_price < minTicketPrice || event_ticket_price >maxTicketPrice){
            return {success: false, message: `Invalid ticket price: ${event_ticket_price}. Ticket price must be in range: ${minTicketPrice}$ to ${maxTicketPrice}.`};
        }

    }



    //TODO:Need to check if image contains profane material:




    return {success: true};

}

function isValidDateStrict(dateString) {
    return moment(dateString, "YYYY-MM-DD", true).isValid();
}


async function isSafeText(text){

    const result = await checkprofanity(text);
        
    if (!result.success){
        console.log("Failed to check for profanity."); //TODO: Allow post to be created but keep track of it.
        return false;
    }

    if (result.data['is-bad']){
        return false;
    }

    return true;

}

async function isSafeImage(imagePath){

    return true;
    /*
    try {
        const [result] = await vision_client.safeSearchDetection(imagePath);
        const detections = result.safeSearchAnnotation;

        console.log("Safe search results: ", detections);

        return !(detections.adult === 'LIKELY' || detections.adult === 'VERY_LIKELY' || detections.violence === 'LIKELY' || detections.violence === 'VERY_LIKELY');
    }
    catch (err){
        console.error("Error analyzing image:", err);
    }
    */
}

export default router;

//app.listen(5002, '0.0.0.0', () => console.log(`Listening on port 5002...`));