import { isValidInput } from "../InputSanitization/InputSanitization.js";
import db from "../db.js";


export async function get_club_search_by_title(search_title, searcher_username){

    try {

        if (!isValidInput(search_title)){
            return {succes: false, message: "Invalid search input. Input must only contain characters or numbers."}
        }

        const [row] = await db.execute('CALL select_clubs_by_name(?, ?)', [search_title, searcher_username]);

        return {success: true, data: row[0]};
    }
    catch (err){
        return {success: false, message: "Cannot retrieve search results from database. Error occurred.", error: err};
    }

} 


export async function get_club_search_by_crn(club_crn, searcher_username){

    try {
        
        if (!isValidInput(club_crn)){
            return {succes: false, message: "Invalid search input. Input must only contain characters or numbers."}
        }

        const [row] = await db.execute('CALL select_clubs_by_crn(?, ?)', [club_crn, searcher_username]);

        return {success: true, data: row[0]};
    }
    catch (err){
        return {success: false, message: "Cannot retrieve search results from database. Error occurred.", error: err};
    }

} 


export async function user_follow_unfollow_club(username, club_crn){

    try {

        const [row] = await db.execute('CALL user_follow_unfollow_club(?,?)', [username, club_crn]);

        return {success: true, message: "Successfully followed club."};
        
    }
    catch (err){

        return {success: false, message: "Error while querying new user follow into database.", error: err};

    }

}