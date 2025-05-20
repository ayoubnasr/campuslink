DELIMITER $$
CREATE PROCEDURE insert_event_participation (IN event_id_input INT, IN username_input VARCHAR(50))
BEGIN

    IF NOT EXISTS ( SELECT 1 FROM event_participants WHERE event_id = event_id_input AND username = username_input) THEN
        INSERT INTO event_participants (event_id, username)
        VALUES (event_id_input, username_input);
    END IF;

END$$

CREATE PROCEDURE remove_event_participation (IN event_id_input INT, IN username_input VARCHAR(50))
BEGIN

    DELETE FROM event_participants WHERE event_id = event_id_input AND username = username_input;

END$$

DELIMITER ;