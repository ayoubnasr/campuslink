import dotenv from 'dotenv';

import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import moment from 'moment';
import vision from '@google-cloud/vision';
import { get_club_search_by_crn, get_club_search_by_title, user_follow_unfollow_club } from './dbfuncs_discovery.js';
import { verifyJwtToken, verifyUserExists } from '../AuthorizationMiddleware.js';

dotenv.config({path: '../../../.env'});

const router = express.Router();

router.use(cookieParser());

const ClubSearchType = {

    byTitle: 'byTitle',
    byCRN: 'byCRN'

}

/*
router.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // This is important for sending cookies
}));
*/

const vision_client = new vision.ImageAnnotatorClient({

    keyFile: '../../../' + process.env.GOOGLE_VISION_CREDENTIALS_PATH

});



router.get('/search-accounts', verifyJwtToken, verifyUserExists, async (req, res) => {

    //Given: part of a club name --> Return: list of relevant accounts

    const { username } = req.user;


    const {type, search} = req.query;

    if (!search){
        res.status(404).json({success: false, message: 'Invalid input, no search phrase entered.'});
        return;
    }

    if (Object.values(ClubSearchType).includes(type) === false){
        res.status(404).json({success: false, message: 'Invalid club-search type.'});
        return;
    }

    let search_results = null;

    switch (type){
        case ClubSearchType.byTitle:
            search_results = await get_club_search_by_title(search, username);
            break;
        case ClubSearchType.byCRN:
            search_results = await get_club_search_by_crn(search, username);
            break;
    }

    if (!search_results){
        res.status(404).json({success: false, message: 'Something went wrong. Search result is null.'});
        return;
    }

    if (search_results.success === false){
        res.status(404).json(search_results);
        return;
    }

    res.status(200).json({success: true, message: 'Search successful.', result: search_results.data})
    return;

});


router.post('/follow', verifyJwtToken, verifyUserExists, async (req, res) => {

    //Given username and club crn:
    const { username } = req.user;
    const { club_crn } = req.body;

    if (!username || !club_crn){
        req.status(404).json({success: false, message: 'Invalid input. Username and club crn cannot be null.'});
        return;
    }

    const follow_query_result = await user_follow_unfollow_club(username, club_crn);
    
    res.status((follow_query_result.success)?200:404).json(follow_query_result);
    return;

});

export default router;

//app.listen(5003, '0.0.0.0', () => console.log(`Listening on port 5003...`));