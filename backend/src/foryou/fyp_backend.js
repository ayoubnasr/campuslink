
import dotenv from 'dotenv';

import express from 'express';

import { getUserFeed_DB_LatestFirst, userInteractTransaction } from "./fyp_dbfuncs.js";
import { verifyJwtToken, verifyUserExists } from '../AuthorizationMiddleware.js';

import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config({path: '../../../.env'});


const router = express.Router();

router.use(cookieParser());

/*
router.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // This is important for sending cookies
}));
*/

const feedLimit = 10;


router.get('/feed', verifyJwtToken, verifyUserExists, async (req, res) => {

    //Need to read the username from the JWT token:

    const username = req.user.username;

    //As the user scrolls down, page number will increase and the offset will change, so we will request a new set of posts from the database:
    const {page = 1, limit = 10} = req.query;


    const newPage = await getUserFeed_DB_LatestFirst(username, limit);

    console.log("YA BU ALI: ", newPage);
    
    //Finally, send the feed to the frontend to be rendered:
    if (newPage){
        res.status(200).json({success: true, feed: newPage});
        return;
    }
    else {
        res.status(404).json({success: false, message: 'No new feed loaded from database.'});
        return;
    }


});


router.get('/interaction', verifyJwtToken, verifyUserExists, async (req, res) => {

    const { username } = req.user;

    const { post_id, interaction } = req.body; //The post_id will be sent from the frontend depending on what post the user interacted with

    //interaction will be an object containing the interaction details (like, share, comment submit..)

    const result = await userInteractTransaction(username, post_id, interaction);

    const stts = (result.success)?200:401;

    res.status(stts).json(result);
    return;

});

export default router;
//app.listen(5001, '0.0.0.0', () => console.log(`Listening on port 5001...`));