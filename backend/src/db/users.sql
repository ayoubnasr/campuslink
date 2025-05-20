DELIMITER $$

CREATE FUNCTION CheckUserExists(username_input VARCHAR(50))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_exists INT;

    SELECT EXISTS(SELECT 1 FROM users WHERE username = username_input LIMIT 1) INTO user_exists; -- We used SELECT 1 so that we don't have to return the actual column values, we just return 1 for every row that was selected.
    -- then we do LIMIT 1 so that it stops when it finds 1 row. There can be no more than 1 row with the same username.

    RETURN user_exists;
END$$

CREATE PROCEDURE InsertNewUser (username_input VARCHAR(50), email_input VARCHAR(255), password_hash_input VARCHAR(255))
BEGIN
    INSERT INTO users (username, email, password_hash)
    VALUES (username_input, email_input, password_hash_input);
END$$

CREATE PROCEDURE GetUser(username_input VARCHAR(50))
BEGIN

    SELECT * FROM users WHERE username = username_input;

END$$

-- User password queries:

CREATE FUNCTION CheckUserPassHash (username_input VARCHAR(50), password_hash_input VARCHAR(255))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_pass_hash VARCHAR(255);

    SELECT password_hash FROM users WHERE username = username_input INTO user_pass_hash;

    RETURN IF(user_pass_hash = password_hash_input, 1, 0);

END$$


CREATE PROCEDURE get_user_profile (IN username_input VARCHAR(50))
BEGIN
    SELECT username, firstname, familyname, email, 
    profile_pic_url, bio
    FROM users 
    WHERE username = username_input;
END$$

DELIMITER ;