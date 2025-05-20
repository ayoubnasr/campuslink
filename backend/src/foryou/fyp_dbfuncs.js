import db from '../db.js';

export async function getUserFeed_DB(username, feedLength, seen_posts_time_range, sort_option){

    //First I must get the user's Feed:
    const [row] = await db.execute('CALL get_userfeed(?, ?, ?, ?)', [username, feedLength, seen_posts_time_range, sort_option]);

    return row[0];//This will return the first result set, which is expected to be the only result set.

}

export async function getUserFeed_DB_LatestFirst(username, feedLength){

    return getUserFeed_DB(username, feedLength, 12, 'latest');

}

export async function getUserFeed_DB_OldestFirst(username, feedLength){

    return getUserFeed_DB(username, feedLength, 12, 'oldest');

}



///User interaction query functions:

export async function userComment_DB(username, post_id, comment){

    try {
        await db.execute('CALL add_usercomment(?, ?)', [username, post_id, comment]);
        return {success: true};
    }
    catch (err){
        return {success: false, error: err};
    }

}


export async function userInteractTransaction(username, post_id, interaction){


    const connection = await db.pool.promise().getConnection();

    try {

        await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        
        await connection.beginTransaction();

        if (interaction.isLike){
            await connection.execute('CALL insert_or_delete_userlike(?, ?)', [username, post_id]);
        }
        
        //TODO: Implement the commenting queries:

        return {success: true};

    }
    catch (err){

        return {success: false, message: 'falafel', error:err};

    }

}