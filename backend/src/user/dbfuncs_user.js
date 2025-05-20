import db from '../db.js';


export async function get_user_profile(username){

    try {
        const [row] = await db.execute('CALL get_user_profile(?)', [username]);

        return {success: true, profile: row[0][0]};
    }
    catch (err){
        return {success: false, message: 'Cannot retrieve user profle. Unexpected error occurred,', error: err.message};
    }

}

export async function user_register_event(event_id, username){

    try {
        const [row] = await db.execute('CALL insert_event_participation(?, ?)', [event_id, username]);

        return {success: true};
    }
    catch (err){
        return {success: false, message: 'Cannot register user to event. Unexpected error occurred,', error: err.message};
    }

}

export async function user_unregister_event(event_id, username){

    try {
        const [row] = await db.execute('CALL remove_event_participation(?, ?)', [event_id, username]);

        return {success: true};
    }
    catch (err){
        return {success: false, message: 'Cannot unregister user from event. Unexpected error occurred,', error: err.message};
    }

}