DELIMITER $$

CREATE PROCEDURE select_clubs_by_name (IN search_title VARCHAR(255), IN searcher_username VARCHAR(50))
BEGIN

    SELECT A.crn AS club_crn, A.title AS club_title, A.profile_pic_url AS club_profile_pic_url,
    CASE WHEN B.username IS NOT NULL THEN 'Followed' ELSE 'Not Followed' END AS follow_status
    FROM clubs A
    LEFT JOIN club_followers B
    ON A.crn = B.club_crn AND B.username = searcher_username
    WHERE A.title LIKE CONCAT ('%', search_title, '%');
END$$

CREATE PROCEDURE select_clubs_by_crn (IN search_crn INT, IN searcher_username VARCHAR(50))
BEGIN

    SELECT A.crn AS club_crn, A.title AS club_title,
    CASE WHEN B.username IS NOT NULL THEN 'Followed' ELSE 'Not Followed' END AS follow_status
    FROM clubs A
    LEFT JOIN club_followers B
    ON A.crn = B.club_crn AND B.username = searcher_username
    WHERE CAST(crn AS CHAR) LIKE CONCAT('%', search_crn, '%');

END$$

CREATE PROCEDURE user_follow_unfollow_club (username_input VARCHAR(50), club_crn_input INT)
BEGIN
    -- Need to insert into the club_followers table:
    IF EXISTS (SELECT 1 FROM club_followers WHERE username = username_input AND club_crn = club_crn_input) THEN
        -- then remove from table:
        DELETE FROM club_followers WHERE username = username_input AND club_crn = club_crn_input;
    ELSE
        INSERT INTO club_followers (club_crn, username)
        VALUES (club_crn_input, username_input);
    END IF;
END$$

DELIMITER ;