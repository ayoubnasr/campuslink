import db from "../db.js";

/**
 * This function retrieves the user object with the given username from the table of users in the database. If the user is not found it returns null.
 * @param {*} username the username to search the database by
 * @returns either the user or null if no user with the specified username exits
 */
export async function getUserFromDB(username){

    const [rows] = await db.execute('CALL GetUser(?)', [username]);
    //So, db.execute will return two arrays in an array: [rows, fields], where rows is itself an array of result sets where each result set contains an array of rows
    //The fields is an array of metadata (like column names...)

    return rows[0][0];
    
}

/**
 * This function calls the database function that checks if a user with the given username exists.
 * 
 * @param {*} username the username to search for.
 * @returns true if user found and false otherwise
 */
export async function checkUserInDB(username){

    const [rows] = await db.execute('SELECT CheckUserExists(?) AS userExists', [username]);

    return rows[0].userExists;

}

/**
 * This function retrieves the club object with the given crn from the table of clubs in the database. If the club is not found it returns null.
 * @param {*} crn the crn to search the database by
 * @returns either the user or null if no user with the specified username exits
 */
export async function getClubFromDB(crn){

    const [rows] = await db.execute('CALL GetClub(?)', [crn]);
    //So, db.execute will return two arrays in an array: [rows, fields], where rows is itself an array of result sets where each result set contains an array of rows
    //The fields is an array of metadata (like column names...)

    return rows[0][0];
    
}
/**
 * 
 * @param {*} username 
 * @param {*} email 
 * @param {*} hashedPass 
 * @param {*} verif_token 
 * @returns an object with three fields: success (boolean) and a message string, and the error if one was caught.
 */
export async function insertNewUser(username, email, hashedPass){

    try {
        await db.execute('CALL InsertNewUser(?, ?, ?)', [username, email, hashedPass]);
        return { success: true, message: 'User-insertion query successful.'}
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY'){//If username exists
            return { success: false, message: 'Username already exists in database.', error};
        }

        console.error('Database Error: ', error);
        return { success: false, message: 'Database error occurred.', error};
    }
}

/**
 * Replaces the user's verification token with a new one, valid for valid_seconds.
 */
export async function insertVerifToken(username, verif_token, valid_seconds){

    try {
        await db.execute('CALL DeleteVerifTokenByUser(?)', [username]);
        await db.execute('CALL InsertVerifToken(?, ?, ?)', [verif_token, username, valid_seconds]);

        return { success: true, message: 'Successfully inserted verification token.'};
    }
    catch (error) {
        console.error('Database Error: ', error);
        return { success: false, message: 'Database error while inserting verification token.', error};
    }
}

/**
 * Seconds until the user's current verification link expires, or 0 if they have no valid link.
 */
export async function getVerifTokenSecondsLeft(username){

    const [rows] = await db.execute('CALL GetVerifTokenSecondsLeft(?)', [username]);

    return Math.max(0, Number(rows[0][0]?.seconds_left) || 0);
}

/**
 * This function calls the database procedures responsible for deleting expired verification tokens and passreset tokens.
 */
export async function deleteExpiredTokens(){

    try {
        await db.execute('CALL DeleteExpiredVerifTokens()');
    
        await db.execute('CALL DeleteExpiredPassResetTokens()');
        
        return { success: true, message: 'Deleted expired tokens successfully.'}
    }
    catch (error){
        return { success: false, message: 'Database error while deleting expired tokens', error};
    }
}

export async function getUsernameFromVerifToken(token){
    const [row] = await db.execute('CALL GetUserFromVerifToken(?)',[token]);
    
    return (row[0][0])?row[0][0].username : null;
}

export async function getUsernameFromPassResetToken(token){

    const [rows] = await db.execute('CALL GetUserFromPassResetToken(?)', [token]);

    return (rows[0][0])?rows[0][0].username : null;

}

/**
 * Stores a new password reset token for the user, replacing any previous one.
 * @param {*} username the user requesting the reset
 * @param {*} token the reset token emailed to the user
 */
export async function insertPassResetToken(username, token){

    await db.execute('CALL DeletePassResetTokenByUser(?)', [username]);
    await db.execute('CALL InsertPassResetToken(?, ?)', [token, username]);

}

export async function modifyUserPassword(username, newpasshash){

    try{

        await db.execute('CALL ModifyUserPass(?, ?)', [username, newpasshash]);

        return { success: true, message: 'User password successfully changed.'};

    }
    catch (error){
        return { success: false, message: 'Database error while reseting user password.', error};
    }

}