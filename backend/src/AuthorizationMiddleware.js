
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { get_user_profile } from './user/dbfuncs_user.js';

dotenv.config();

export function verifyJwtToken(req, res, next){

    const token = req.cookies.authtoken;

    try {
        const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedJWT){
            res.status(404).json({success: false, message: 'Empty token', error: err});
            return;
        }

        req.user = decodedJWT;
        
        next();

    }
    catch (err){
        res.status(404).json({success: false, message: 'Invalid token', tokenStr: "token: " + req.cookies.authtoken, error: err});
        return;
    }

}

export function verifyAuthorizedCabinet(req, res, next){

    const { user } = req;

    if (!user){
        return res.status(404).json({success: false, message: 'Failed to authorize user in cabinet authorization. User is null.'});
    }

    const { role } = user;

    if (!role) return res.status(404).json({success: false, message: 'Failed to authorize user in cabinet authorization. Role is null.'});

    if (role != 'cabinet'){
        return res.status(404).json({success: false, message: 'Failed to authorize user in cabinet authorization. User is not a cabinet member.'});
    }

    next();

}

/**
 * This function expects that the user jwt has already been verified and will use the username stored inside the JWT.
 */
export async function verifyUserExists(req, res, next){


    const userprofile_result = await get_user_profile(req.user.username);

    if (!userprofile_result.success) return res.status(404).json(userprofile_result);

    if (!userprofile_result.profile || userprofile_result.profile.length === 0) return res.status(404).json({success: false, message: "Invalid user. User not found in database."});

    next();

}
