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
        await db.execute('CALL add_usercomment(?, ?, ?)', [username, post_id, comment]);
        return {success: true};
    }
    catch (err){
        return {success: false, message: 'Cannot add comment. Unexpected error occurred.', error: err};
    }

}

export async function getPostComments_DB(post_id){

    try {
        const [row] = await db.execute('CALL get_post_comments(?)', [post_id]);
        return {success: true, comments: row[0]};
    }
    catch (err){
        return {success: false, message: 'Cannot load comments. Unexpected error occurred.', error: err};
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

        await connection.commit();

        return {success: true};

    }
    catch (err){

        await connection.rollback();

        return {success: false, message: 'Cannot save interaction. Unexpected error occurred.', error:err};

    }
    finally {

        //Always give the connection back to the pool, otherwise the pool runs out and every query hangs:
        connection.release();

    }

}
