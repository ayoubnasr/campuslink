
import dotenv from 'dotenv';

import express from 'express';

import { getUserFeed_DB_LatestFirst, getPostComments_DB, userComment_DB, userInteractTransaction } from "./fyp_dbfuncs.js";
import { verifyJwtToken, verifyUserExists } from '../AuthorizationMiddleware.js';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Filter } from 'bad-words';

dotenv.config({path: '../../../.env'});


const router = express.Router();

router.use(express.json());
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
const maxCommentLen = 2500; //Matches the CHECK constraint on post_comments.comment_text
const profanityFilter = new Filter();


router.get('/feed', verifyJwtToken, verifyUserExists, async (req, res) => {

    //Need to read the username from the JWT token:

    const username = req.user.username;

    //As the user scrolls down, page number will increase and the offset will change, so we will request a new set of posts from the database:
    const {page = 1, limit = 10} = req.query;


    const newPage = await getUserFeed_DB_LatestFirst(username, limit);

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


router.post('/interaction', verifyJwtToken, verifyUserExists, async (req, res) => {

    const { username } = req.user;

    const { post_id, interaction } = req.body; //The post_id will be sent from the frontend depending on what post the user interacted with

    //interaction will be an object containing the interaction details (like, share, comment submit..)

    if (!post_id || !interaction){
        return res.status(400).json({success: false, message: 'Invalid input. post_id and interaction are required.'});
    }

    const result = await userInteractTransaction(username, post_id, interaction);

    const stts = (result.success)?200:401;

    res.status(stts).json(result);
    return;

});


router.get('/comments', verifyJwtToken, verifyUserExists, async (req, res) => {

    const post_id = Number(req.query.post_id);

    if (!Number.isInteger(post_id) || post_id <= 0){
        return res.status(400).json({success: false, message: 'Invalid post id.'});
    }

    const result = await getPostComments_DB(post_id);

    res.status((result.success)?200:500).json(result);

});


router.post('/comment', verifyJwtToken, verifyUserExists, async (req, res) => {

    const { username } = req.user;

    const post_id = Number(req.body.post_id);
    const comment = (typeof req.body.comment === 'string') ? req.body.comment.trim() : '';

    if (!Number.isInteger(post_id) || post_id <= 0){
        return res.status(400).json({success: false, message: 'Invalid post id.'});
    }

    if (comment.length === 0 || comment.length > maxCommentLen){
        return res.status(400).json({success: false, message: `Comment must be between 1 and ${maxCommentLen} characters long.`});
    }

    if (profanityFilter.isProfane(comment)){
        return res.status(400).json({success: false, message: 'Your comment contains language that goes against our community guidelines.'});
    }

    const result = await userComment_DB(username, post_id, comment);

    res.status((result.success)?200:500).json(result);

});

export default router;
//app.listen(5001, '0.0.0.0', () => console.log(`Listening on port 5001...`));
