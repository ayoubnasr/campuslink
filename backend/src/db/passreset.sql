DELIMITER $$

CREATE PROCEDURE InsertPassResetToken (token_input VARCHAR(50), username_input VARCHAR(50))
BEGIN
    INSERT INTO passreset_tokens (token, username)
    VALUES (token_input, username_input);
END$$

CREATE PROCEDURE GetUserFromPassResetToken (token_input VARCHAR(50))
BEGIN
    SELECT username FROM passreset_tokens WHERE token = token_input LIMIT 1;
    
END$$

CREATE PROCEDURE ModifyUserPass (username_input VARCHAR(50), newpasshash_input VARCHAR(50))
BEGIN
    UPDATE users
    SET password_hash = newpasshash_input
    WHERE username = username_input;

    DELETE FROM passreset_tokens WHERE username = username_input;
END$$

CREATE PROCEDURE DeleteExpiredPassResetTokens ()
BEGIN
    DELETE FROM passreset_tokens WHERE CURRENT_TIMESTAMP >= expires_at;
END$$

CREATE PROCEDURE DeletePassResetTokenByUser (username_input VARCHAR(50))
BEGIN
    DELETE FROM passreset_tokens WHERE username = username_input;
END$$

DELIMITER ;