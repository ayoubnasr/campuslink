DELIMITER $$

CREATE PROCEDURE get_userfeed (
    IN username_input VARCHAR(50),
    IN feed_length INT,
    IN seen_posts_time_range INT,
    IN sort_option VARCHAR(20)
)
BEGIN
    DECLARE feed_size INT;
    DECLARE remaining_feed_size INT;
    
    DROP TEMPORARY TABLE IF EXISTS myClubs;
    DROP TEMPORARY TABLE IF EXISTS myRelevantPosts;
    DROP TEMPORARY TABLE IF EXISTS mySeenPosts;
    DROP TEMPORARY TABLE IF EXISTS newfeed;
    DROP TEMPORARY TABLE IF EXISTS feed;
    DROP TEMPORARY TABLE IF EXISTS feed_w_club_info;

    CREATE TEMPORARY TABLE myClubs AS
    SELECT club_crn FROM club_followers WHERE username = username_input;

    CREATE TEMPORARY TABLE myRelevantPosts AS
    SELECT
        posts.post_id, posts.club_crn, posts.title AS post_title, posts.posted_by, 
        posts.image_url AS post_image_url, posts.details AS post_details, 
        posts.created_at, posts.expires_at, posts.is_event,
        club_events.event_id, club_events.event_title, 
        club_events.event_details,
        DATE_FORMAT(club_events.event_date, '%Y-%m-%d') AS event_date,  
        club_events.event_startTime, club_events.event_endTime, 
        club_events.event_location_name, club_events.event_location_latitude, club_events.event_location_longitude,
        club_events.event_max_participation, 
        club_events.event_ticket_price, club_events.event_exclusive,
        EXISTS (
            SELECT 1
            FROM event_participants ep
            WHERE ep.event_id = club_events.event_id AND ep.username = username_input
        ) AS is_event_registered
    FROM myClubs
    JOIN posts ON myClubs.club_crn = posts.club_crn
    LEFT JOIN club_events ON posts.post_id = club_events.event_id;

    CREATE TEMPORARY TABLE newfeed LIKE myRelevantPosts;

    CREATE TEMPORARY TABLE mySeenPosts LIKE myRelevantPosts;
    ALTER TABLE mySeenPosts ADD COLUMN seen_at TIMESTAMP;

    INSERT INTO mySeenPosts
    SELECT A.*, B.seen_at
    FROM myRelevantPosts A
    LEFT JOIN user_seen_posts B
    ON A.post_id = B.post_id
    WHERE B.username = username_input;
    -- mySeenPosts has all the attributes of myRelevantPosts in addition to the seen_at attribute of
    -- the user_seen_posts table.

    INSERT INTO newfeed
    SELECT A.*
    FROM myRelevantPosts A
    LEFT JOIN mySeenPosts B ON A.post_id = B.post_id
    WHERE B.post_id IS NULL
    LIMIT feed_length;

    CREATE TEMPORARY TABLE feed AS
    SELECT * FROM newfeed;

    SELECT COUNT(*) INTO feed_size FROM feed;

    SET remaining_feed_size = feed_length - feed_size;

    -- Insert some seen posts if no more new posts
    IF feed_size < feed_length THEN
        INSERT INTO feed
        SELECT post_id, club_crn, post_title, posted_by, 
        post_image_url, post_details, 
        created_at, expires_at,
        is_event,
        event_id, event_title, 
        event_details, 
        event_date, event_startTime, event_endTime,
        event_location_name, event_location_latitude, event_location_longitude, 
        event_max_participation, 
        event_ticket_price, event_exclusive,
        is_event_registered
        FROM mySeenPosts
        WHERE seen_at IS NOT NULL 
        AND TIMESTAMPDIFF(HOUR, seen_at, CURRENT_TIMESTAMP) < seen_posts_time_range
        LIMIT remaining_feed_size;
    END IF;

    INSERT INTO user_seen_posts (username, post_id, seen_at)
    SELECT DISTINCT username_input, A.post_id, CURRENT_TIMESTAMP
    FROM newfeed A
    LEFT JOIN user_seen_posts B ON A.post_id = B.post_id
    WHERE B.post_id IS NULL;

    CREATE TEMPORARY TABLE feed_w_club_info AS
    SELECT feed.*, clubs.profile_pic_url AS club_profile_pic_url, clubs.title AS club_title 
    FROM feed
    JOIN clubs ON feed.club_crn = clubs.crn;

    IF sort_option = 'latest' THEN
        SELECT * FROM feed_w_club_info ORDER BY created_at DESC;
    ELSEIF sort_option = 'oldest' THEN
        SELECT * FROM feed_w_club_info ORDER BY created_at ASC;
    ELSEIF sort_option = 'most_liked' THEN
        SELECT feed_w_club_info.*, COALESCE(like_count, 0) AS like_count
        FROM feed_w_club_info
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS like_count FROM post_likes GROUP BY post_id
        ) AS table2 ON feed_w_club_info.post_id = table2.post_id
        ORDER BY like_count DESC;
    END IF;

END $$

CREATE PROCEDURE insert_or_delete_userlike (username_input VARCHAR(50), post_id_input INT)
BEGIN
    IF EXISTS (SELECT 1 FROM post_likes WHERE username = username_input AND post_id = post_id_input) THEN
        DELETE FROM post_likes WHERE username = username_input AND post_id = post_id_input;        
    ELSE
        INSERT INTO post_likes (post_id, username)
        VALUES (post_id_input, username_input);
    END IF;
END $$



DELIMITER ;