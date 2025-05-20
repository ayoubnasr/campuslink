DELIMITER $$

CREATE PROCEDURE GetClub(crn_input INT)
BEGIN

    SELECT * FROM clubs WHERE crn = crn_input;

END$$

-- @block

CREATE FUNCTION CheckClubExists(crn_input INT)
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE club_exists INT;

    SELECT EXISTS(SELECT 1 FROM clubs WHERE crn = crn_input LIMIT 1) INTO club_exists;

    RETURN club_exists;

END$$

-- Club password queries

CREATE FUNCTION CheckClubPassHash (crn_input INT, password_hash_input VARCHAR(255))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_pass_hash VARCHAR(255);

    SELECT password_hash FROM clubs WHERE crn = crn_input INTO user_pass_hash;

    RETURN IF(user_pass_hash = password_hash_input, 1, 0);

END$$

CREATE PROCEDURE get_club_profile (
    IN username_input VARCHAR(50),
    IN club_crn_input INT
)
BEGIN
    SELECT 
        c.title AS club_title, 
        c.email AS club_email, 
        c.profile_pic_url AS club_profile_pic_url, 
        c.bio AS club_bio,
        EXISTS (
            SELECT 1 
            FROM club_followers 
            WHERE username = username_input 
            AND club_crn = club_crn_input
        ) AS club_userFollowing,
        COALESCE(pcnt.club_post_count, 0) AS club_post_count,
        COALESCE(evcnt.club_event_count, 0) AS club_event_count
    FROM clubs c
    LEFT JOIN (
        SELECT club_crn, COUNT(*) AS club_post_count
        FROM posts 
        WHERE club_crn = club_crn_input
        GROUP BY club_crn
    ) AS pcnt ON pcnt.club_crn = c.crn
    LEFT JOIN (
        SELECT club_crn, COUNT(*) AS club_event_count
        FROM club_events 
        WHERE club_crn = club_crn_input
        GROUP BY club_crn
    ) AS evcnt ON evcnt.club_crn = c.crn
    WHERE c.crn = club_crn_input;
END$$

CREATE FUNCTION clubTitle_other_exists (title_input VARCHAR(255), curr_club_crn INT)
RETURNS BOOLEAN DETERMINISTIC
BEGIN

    DECLARE exists_flag BOOLEAN DEFAULT FALSE;

    SELECT EXISTS (SELECT 1 FROM clubs WHERE title = title_input AND crn != curr_club_crn) INTO exists_flag;

    RETURN exists_flag;

END $$


CREATE PROCEDURE update_club_profile (
    IN crn_input INT,
    IN title_input VARCHAR(255),
    IN bio_input VARCHAR(512),
    IN email_input VARCHAR(255),
    IN profile_pic_input VARCHAR(2048)
)
BEGIN
    UPDATE clubs
    SET 
        title = IF(title_input IS NOT NULL, title_input, title),
        bio = IF(bio_input IS NOT NULL, bio_input, bio),
        email = IF(email_input IS NOT NULL, email_input, email),
        profile_pic_url = IF(profile_pic_input IS NOT NULL, profile_pic_input, profile_pic_url)
    WHERE crn = crn_input;
END$$



CREATE PROCEDURE get_club_posts (IN club_crn_input INT)
BEGIN

    SELECT clbpsts.*, c.title AS club_title, c.profile_pic_url AS club_profile_pic_url
    FROM
    (
        SELECT 
            p.post_id, p.club_crn, p.title AS post_title, p.posted_by, 
            p.image_url AS post_image_url, p.details AS post_details, 
            p.created_at, p.expires_at, 
            p.is_event,
            ce.event_id,
            ce.event_title, ce.event_details, 
            DATE_FORMAT(ce.event_date, '%Y-%m-%d') AS event_date,
            ce.event_startTime, ce.event_endTime, 
            ce.event_location_name, ce.event_location_latitude, ce.event_location_longitude,
            ce.event_max_participation, 
            ce.event_ticket_price, ce.event_exclusive
        FROM posts p
        LEFT JOIN club_events ce ON p.post_id = ce.event_id
        LEFT JOIN
        (
            SELECT event_id, COUNT(*) AS event_participant_count FROM event_participants
            GROUP BY event_id
        ) AS ev_p
        ON ce.event_id = ev_p.event_id
        WHERE  p.club_crn = club_crn_input
    ) AS clbpsts
    LEFT JOIN clubs c ON clbpsts.club_crn = c.crn
    ORDER BY clbpsts.created_at DESC;

END$$



-- FOR THE GIVEN EVENT ID I NEED TO GET THE USERNAMES, FIRST NAMES,
-- LAST NAMES, EMAILS, AND PROFILE PICS OF PARTICIPANTS
CREATE PROCEDURE get_event_participants (IN event_id_input INT)
BEGIN

    SELECT 
    u.username, u.firstname, u.familyname, u.email, u.profile_pic_url
    FROM users u
    WHERE EXISTS
    (
        SELECT 1 FROM event_participants
        WHERE event_id = event_id_input
        AND username = u.username
    );

END$$



CREATE PROCEDURE insert_post_and_event (
    IN club_crn INT, IN posted_by VARCHAR(50), IN post_title VARCHAR(255),
    IN post_details TEXT, IN post_image_url VARCHAR(2048), IN is_event BOOLEAN,
    IN event_title VARCHAR(255), IN event_details TEXT, IN event_max_participation INT,
    IN event_ticket_price FLOAT, IN event_exclusive BOOLEAN, IN event_date DATE, IN event_startTime TIME, IN event_endTime TIME, 
    IN event_location_name VARCHAR(255), IN event_location_latitude DOUBLE, IN event_location_longitude DOUBLE
    )
BEGIN

    DECLARE new_post_id INT;

    INSERT INTO posts (club_crn, posted_by, title, details, image_url, is_event)
    VALUES (club_crn, posted_by, post_title, post_details, post_image_url, 
    is_event);

    SET new_post_id = (SELECT LAST_INSERT_ID());

    IF is_event = 1 THEN
        INSERT INTO club_events (event_id, club_crn, event_title, 
        event_details, event_max_participation, event_ticket_price, event_exclusive, 
        event_date, event_startTime, event_endTime, event_location_name,
        event_location_latitude, event_location_longitude)
        VALUES (new_post_id,
        club_crn, event_title, event_details,
        event_max_participation, event_ticket_price,
        event_exclusive, event_date, event_startTime, event_endTime, event_location_name,
        event_location_latitude, event_location_longitude);
    END IF;

    SELECT new_post_id AS post_id;

END$$
    
DELIMITER ;