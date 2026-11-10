DELIMITER $$
-- VERIF TOKEN EXISTENCE
CREATE FUNCTION CheckVerifTokenExists (token_input VARCHAR(50))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE token_exists INT;

    SELECT EXISTS(SELECT 1 FROM verification_tokens WHERE token = token_input) INTO token_exists;

    RETURN token_exists;
END$$

-- @block
-- Each token is valid for valid_seconds; the expiry is computed by the database so app and DB clocks can't disagree.
CREATE PROCEDURE InsertVerifToken (token_input VARCHAR(50), username_input VARCHAR(50), valid_seconds INT)
BEGIN
    INSERT INTO verification_tokens (token, username, expires_at)
    VALUES (token_input, username_input, CURRENT_TIMESTAMP + INTERVAL valid_seconds SECOND);
END$$

-- @block
-- Seconds until the user's current verification link expires, or NULL if they have no valid link
-- (a new link may only be sent once the previous one has expired).
CREATE PROCEDURE GetVerifTokenSecondsLeft (username_input VARCHAR(50))
BEGIN
    SELECT TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, MAX(expires_at)) AS seconds_left
    FROM verification_tokens
    WHERE username = username_input AND expires_at > CURRENT_TIMESTAMP;
END$$

-- @block
-- GET USER FROM VERIF TOKEN
CREATE PROCEDURE GetUserFromVerifToken (token_input VARCHAR(50))
BEGIN
    SELECT username FROM verification_tokens
    WHERE token = token_input AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1;
END$$

-- @block
-- This function automatically (1) sets the user's verified to true, (2) removes the verification token from the VerificationTokens table
CREATE PROCEDURE VerifyUser (username_input VARCHAR(50))
BEGIN  
    UPDATE users SET verified = true WHERE username = username_input;
    DELETE FROM verification_tokens WHERE username = username_input;
END$$

-- @block
CREATE PROCEDURE DeleteExpiredVerifTokens ()
BEGIN
    -- Tokens created before expiry was enforced have no expires_at; they count as expired.
    DELETE FROM verification_tokens WHERE expires_at IS NULL OR expires_at <= CURRENT_TIMESTAMP;
END$$

-- @block
CREATE PROCEDURE DeleteVerifTokenByUser (username_input VARCHAR(50))
BEGIN
    DELETE FROM verification_tokens WHERE username = username_input;
END$$

DELIMITER ;