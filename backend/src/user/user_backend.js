
import dotenv from 'dotenv';

//Imports related to server directory creation and storage:
import multer from 'multer';
import fs from 'fs';
import path from 'path';import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';

import { verifyJwtToken, verifyUserExists } from '../AuthorizationMiddleware.js';

import cookieParser from 'cookie-parser';

import { get_user_profile, user_register_event, user_unregister_event } from './dbfuncs_user.js';

dotenv.config({path: '../../../.env'});

const router = express.Router();

router.use(cookieParser());



router.get('/get-user-profile', verifyJwtToken, verifyUserExists, async (req, res) => {

    const { username } = req.user;

    if (!username){
        res.status(404).json({success: false, message: 'Invalid JWT credentials.'});
        return;
    }

    const profile_query_result = await get_user_profile(username);

    if (!profile_query_result.profile) return res.status(404).json({success: false, message: "No user with given username found."});

    return res.status((profile_query_result.success)?200:404).json(profile_query_result);

});


router.get('/get-user-auth-info', verifyJwtToken, verifyUserExists, async (req, res) => {

    if (req.user) return res.status(200).json({success: true, message: 'Retrieved user authorization info successfully.', user: req.user});

    return res.status(404).json({success: false, message: 'Failed to fetch user authorization info. No user info found.'});

});

router.post('/register-user-event', verifyJwtToken, verifyUserExists, async (req, res) => {

    const username = req.user.username;

    const event_id = req.body.event_id;

    const registration_query_result = await user_register_event(event_id, username);

    if (registration_query_result.success === false){
        return res.status(401).json({success: false, message: registration_query_result.message, error: registration_query_result.error});
    }

    return res.status(200).json({success: true, message: "User registered successfully."});

});

router.post('/unregister-user-event', verifyJwtToken, verifyUserExists, async (req, res) => {

    const username = req.user.username;

    const event_id = req.body.event_id;

    const registration_query_result = await user_unregister_event(event_id, username);

    if (registration_query_result.success === false){
        return res.status(401).json({success: false, message: registration_query_result.message, error: registration_query_result.error});
    }

    return res.status(200).json({success: true, message: "User unregistered successfully."});

});

export default router;