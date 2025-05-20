-- @block Table to store user accounts
CREATE TABLE users (

    username VARCHAR(50) PRIMARY KEY,
    firstname VARCHAR(50) DEFAULT NULL,
    familyname VARCHAR(50) DEFAULT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_pic_url VARCHAR(2048) DEFAULT NULL,
    bio VARCHAR(2048) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE
);

-- @block Table to store club accounts
CREATE TABLE clubs (

    crn INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    title VARCHAR(255) UNIQUE NOT NULL,
    bio VARCHAR(512) DEFAULT NULL,
    email VARCHAR(255) UNIQUE DEFAULT NULL,
    profile_pic_url VARCHAR(2048) DEFAULT NULL

);

-- @block Table to store club accesses by users
CREATE TABLE club_accesses (

    crn INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL
);

-- @block Table to store the temporary verification tickets
CREATE TABLE verification_tokens (

    token VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL,
    INDEX idx_username (username)
);

-- @block Table to store temporary password reset tokens
CREATE TABLE passreset_tokens (

    token VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL,
    INDEX idx_username (username)
);

CREATE TABLE IF NOT EXISTS club_followers (

    club_crn INT,
    username VARCHAR(50),
    follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(club_crn, username),
    FOREIGN KEY (club_crn) REFERENCES clubs (crn) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE,
    INDEX idx_username (username) -- useful when retrieving the clubs that a certain user follows

);



CREATE TABLE IF NOT EXISTS posts (

    post_id INT AUTO_INCREMENT PRIMARY KEY,
    club_crn INT,
    posted_by VARCHAR(50),

    is_event BOOLEAN DEFAULT NULL, -- If it is an event post then this won't be null

    title VARCHAR(255) NOT NULL,
    details TEXT CHECK (CHAR_LENGTH(details) <= 2500),
    image_url VARCHAR(2048) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT NULL,
    FOREIGN KEY (club_crn) REFERENCES clubs (crn) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_title (title)

);

CREATE TABLE IF NOT EXISTS user_seen_posts (

    post_id INT,
    username VARCHAR(50),
    seen_at TIMESTAMP,
    PRIMARY KEY (post_id, username),
    FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE

);

-- @block Table for post likes (Users can like announcements & events)
CREATE TABLE IF NOT EXISTS post_likes (
    post_id INT,
    username VARCHAR(50),
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, username),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- @block Table for post comments (Users can comment on announcements & events)
CREATE TABLE IF NOT EXISTS post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    comment_text TEXT CHECK (CHAR_LENGTH(comment_text) <= 2500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Event Schemas:

CREATE TABLE IF NOT EXISTS club_events (

    event_id INT PRIMARY KEY,
    club_crn INT,
    event_title VARCHAR(255) NOT NULL,
    event_details TEXT CHECK (CHAR_LENGTH(event_details) <= 2500),
    event_max_participation INT UNSIGNED DEFAULT NULL,
    event_ticket_price FLOAT UNSIGNED,
    event_exclusive BOOLEAN DEFAULT FALSE,
    event_date DATE,
    event_startTime TIME,
    event_endTime TIME,
    event_location_name VARCHAR(255),
    event_location_latitude DOUBLE, 
    event_location_longitude DOUBLE,
    INDEX idx_title (event_title), -- Useful to select events by title
    INDEX idx_club (club_crn)

);

-- @block Table for event participants (Users attending events)
CREATE TABLE IF NOT EXISTS event_participants (
    event_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, username),
    FOREIGN KEY (event_id) REFERENCES club_events(event_id) ON DELETE RESTRICT,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE RESTRICT
);

-- INTERESTS TABLES:

-- @block Table for interests (Users and posts can have interests)
CREATE TABLE IF NOT EXISTS interests (
    interest_name VARCHAR(255) PRIMARY KEY
);

-- @block Table to store post-to-interest mapping
CREATE TABLE post_interests (
    post_id INT,
    interest_name VARCHAR(255),
    PRIMARY KEY (post_id, interest_name), -- Composite primary key
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (interest_name) REFERENCES interests(interest_name) ON DELETE CASCADE
);

-- @block Table to store user interests
CREATE TABLE user_interests (
    username VARCHAR(50),
    interest_name VARCHAR(255),
    interest_points INT DEFAULT 1, -- Tracks how much the user interacts with this interest
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the interest was last used
    PRIMARY KEY (username, interest_name),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (interest_name) REFERENCES interests(interest_name) ON DELETE CASCADE
);
