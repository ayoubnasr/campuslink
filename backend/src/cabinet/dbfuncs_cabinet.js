import db from '../db.js';

export async function addNewPost(post_obj){

    try {
        
        const {club_crn, post_title, post_details, post_image_url, posted_by, 
        is_event, event_title, event_details, event_max_participation, event_ticket_price, 
        event_exclusive, event_date, event_startTime, event_endTime, event_location_name, event_location_latitude, event_location_longitude} = post_obj;

        const [row] = await db.execute('CALL insert_post_and_event(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [club_crn, posted_by, post_title, post_details, post_image_url, 
            is_event, event_title, event_details, event_max_participation, event_ticket_price, 
            event_exclusive, event_date, event_startTime, event_endTime, event_location_name, event_location_latitude, event_location_longitude]);

        return {success: true, post_id: row[0][0]};
    }
    catch (err){
        return {success: false, message: 'Cannot insert post into database. Unexpected error occurred.', error: err, postobj: post_obj};
    }


}

export async function clubTitle_other_exists(club_title, curr_club_crn){

    try {
        const [row] = await db.execute('SELECT clubTitle_other_exists(?,?) AS exists_flag', [club_title, curr_club_crn]);

        console.log(row);

        return {success: true, value: row[0].exists_flag};
    }
    catch (err){
        return {success: false, message: 'Failed to check database for other existing clubs with same title.', error: err}
    }

}

export async function get_club_profile(username, club_crn){

    try {
        const [row] = await db.execute('CALL get_club_profile(?, ?)', [username, club_crn]);

        return {success: true, profile: row[0][0]};
    }
    catch (err){
        return {success: false, message: 'Cannot retrieve club profle. Unexpected error occurred,', error: err};
    }

}

/**
 * Updates the club information with the given club CRN. Pass the fields null if you don't want to change them.
 * @param {*} club_crn Cannot be null
 * @param {*} club_title Pass it null if you don't want to change it.
 * @param {*} club_bio Pass it null if you don't want to change it.
 * @param {*} club_email Pass it null if you don't want to change it.
 * @param {*} club_profile_pic_url Pass it null if you don't want to change it.
 * @returns 
 */
export async function update_club_profile(club_crn, club_title, club_bio, club_email, club_profile_pic_url){
    
    try {
        await db.execute('CALL update_club_profile(?,?,?,?,?)', [club_crn, club_title, club_bio, club_email, club_profile_pic_url]);

        return {success: true};
    }
    catch (err){
        return {success: false, message: 'Cannot retrieve club profle. Unexpected error occurred,', error: err};
    }
}

export async function get_club_posts(club_crn){

    try {
        const [row] = await db.execute('CALL get_club_posts(?)', [club_crn]);

        return {success: true, posts: row[0]};
    }
    catch (err){
        return {success: false, message: 'Cannot retrieve club posts. Unexpected error occurred,', error: err};
    }

}

export async function get_event_participants(event_id){

    try {
        const [row] = await db.execute('CALL get_event_participants(?)', [event_id]);

        return {success: true, participant_list: row[0]};
    }
    catch (err){
        return {success: false, message: 'Cannot retrieve event participants. Unexpected error occurred,', error: err};
    }

}