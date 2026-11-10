/**
 * Fills the database with demo content: six clubs with photos, announcements and upcoming events,
 * a demo student account that follows some of them, and a few other students who like, comment and register.
 *
 *   npm run db:seed        (from backend/, after npm run db:init)
 *
 * Safe to re-run: it first deletes everything it created before (demo users, demo clubs and their posts),
 * so it also resets whatever visitors did with the demo account. Real users and clubs are not touched,
 * except that their likes/comments/registrations on demo posts go away with those posts.
 *
 * Images come from backend/seed/images (free Unsplash photos via picsum.photos, see CREDITS.md) and are
 * copied to the same folder uploaded images are served from (UPLOADS_DIR, see cabinet_backend.js).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const DEMO_STUDENT = { email: 'demo@mail.aub.edu', password: 'CampusLink!Demo2025' };
export const DEMO_CLUB_PASSWORD = 'Club!Demo#2025';

const imagesDir = path.join(__dirname, '../seed/images');
// Same location the cabinet router stores uploads in:
const compressedDir = path.join(process.env.UPLOADS_DIR || path.join(__dirname, '../src/cabinet'), 'compressed');

const students = [
    { username: 'demo', firstname: 'Demo', familyname: 'Student', bio: 'Exploring CampusLink. Computer science, hiking and live music.' },
    { username: 'mkhoury', firstname: 'Maya', familyname: 'Khoury', bio: 'Architecture student and film photography nerd.' },
    { username: 'ksaad', firstname: 'Karim', familyname: 'Saad', bio: 'CS junior. Ask me about hackathons.' },
    { username: 'lhaddad', firstname: 'Lina', familyname: 'Haddad', bio: 'Reading, writing, and too much coffee.' },
    { username: 'ofarah', firstname: 'Omar', familyname: 'Farah', bio: 'Guitarist. Weekend hiker.' },
    { username: 'naziz', firstname: 'Nour', familyname: 'Aziz', bio: 'Nutrition major who cooks for everyone.' },
];

// Location used for events (AUB campus, Beirut):
const campus = { lat: 33.9006, lng: 35.4807 };

/**
 * Posts are listed newest first. `ago` is how many hours ago the post was published;
 * events have `in` = days from today until the event.
 */
const clubs = [
    {
        crn: 2101, title: 'AUB Coding Club', email: 'coding.club@mail.aub.edu', logo: 'coding-logo', cabinet: 'demo',
        bio: 'Workshops, hackathons and side projects for anyone who likes to build things with code. All levels welcome.',
        posts: [
            { ago: 3, image: 'coding-hackathon', title: 'CampusHack 2025: registration is open!',
              details: '24 hours, teams of up to four, mentors from local startups and prizes for the top three projects. Beginners are very welcome; we will help you find a team.',
              event: { in: 12, title: 'CampusHack 2025', start: '10:00', end: '22:00', place: 'Bechtel Engineering Building', max: 120, price: 0 } },
            { ago: 30, image: 'coding-workshop', title: 'Intro to Git & GitHub workshop',
              details: 'Never used Git? Bring your laptop and leave with your first repository, branch and pull request. Snacks provided.',
              event: { in: 4, title: 'Intro to Git & GitHub', start: '17:00', end: '19:00', place: 'Bechtel 302', max: 40, price: 0 } },
            { ago: 75, image: 'coding-webdev', title: 'Web dev study group starts next week',
              details: 'Every Tuesday we will build a small full-stack app together (React + Express). Drop a comment if you want to join and we will add you to the group chat.' },
            { ago: 160, image: 'coding-setup', title: 'Thanks for coming to our first meetup!',
              details: 'Over 60 of you showed up. Slides from the talks are on our page, and the next meetup is in two weeks.' },
        ],
    },
    {
        crn: 2102, title: 'Photography Society', email: 'photo.society@mail.aub.edu', logo: 'photo-logo', cabinet: 'mkhoury',
        bio: 'Photo walks, critiques and exhibitions. Phone, digital or film: every camera counts.',
        posts: [
            { ago: 8, image: 'photo-walk', title: 'Golden hour photo walk along the Corniche',
              details: 'Meet at Main Gate, walk to the Corniche and shoot the sunset together. Any camera works, including your phone.',
              event: { in: 3, title: 'Golden Hour Photo Walk', start: '16:30', end: '18:30', place: 'Main Gate', max: 30, price: 0 } },
            { ago: 52, image: 'photo-film', title: 'Film photography 101',
              details: 'We are lending out our club film cameras for a week. Learn how to load film, meter light and develop your first roll.',
              event: { in: 9, title: 'Film Photography 101', start: '15:00', end: '17:00', place: 'West Hall, Room 205', max: 15, price: 5 } },
            { ago: 130, image: 'photo-exhibit', title: 'Submissions open for the spring exhibition',
              details: 'Theme: "Campus life". Send up to three photos by the end of the month. Selected photos will be printed and shown in West Hall.' },
        ],
    },
    {
        crn: 2103, title: 'Music Club', email: 'music.club@mail.aub.edu', logo: 'music-logo', cabinet: 'ofarah',
        bio: 'Jam sessions, open mics and concerts. Bring your instrument, or just your ears.',
        posts: [
            { ago: 5, image: 'music-openmic', title: 'Open Mic Night: sign up to perform',
              details: 'Five-minute slots: songs, poetry, stand-up, anything goes. Sign-up sheet at the door, first come first served.',
              event: { in: 6, title: 'Open Mic Night', start: '19:00', end: '22:00', place: 'West Hall Auditorium', max: 150, price: 0 } },
            { ago: 40, image: 'music-concert', title: 'Spring concert tickets are out',
              details: 'Three student bands, one night. Proceeds go to the music scholarship fund.',
              event: { in: 18, title: 'Spring Concert', start: '20:00', end: '23:00', place: 'Assembly Hall', max: 300, price: 10 } },
            { ago: 96, image: 'music-piano', title: 'Practice rooms are now bookable',
              details: 'Members can book the piano room in West Hall in one-hour slots. Message us to get access.' },
            { ago: 200, image: 'music-lights', title: 'What a night!',
              details: 'Thank you to everyone who came to the welcome concert. We counted more than 250 of you!' },
        ],
    },
    {
        crn: 2104, title: 'Outdoors & Hiking Club', email: 'hiking.club@mail.aub.edu', logo: 'hiking-logo', cabinet: 'ofarah',
        bio: 'Day hikes and weekend trips across Lebanon. Transport is organised, you bring the energy.',
        posts: [
            { ago: 12, image: 'hiking-waterfall', title: 'Day hike: Jabal Moussa waterfalls',
              details: 'Moderate 12 km loop through the reserve. The bus leaves Main Gate at 7:00. Price includes transport and entrance fees.',
              event: { in: 5, title: 'Jabal Moussa Day Hike', start: '07:00', end: '17:00', place: 'Jabal Moussa Biosphere Reserve', max: 45, price: 15,
                       lat: 34.0485, lng: 35.7316 } },
            { ago: 60, image: 'hiking-trail', title: 'Gear checklist for beginners',
              details: 'Good shoes, two litres of water, a hat and a snack. That is really all you need for our day hikes. The full list is pinned on our page.' },
            { ago: 110, image: 'hiking-valley', title: 'Weekend camping trip to the Cedars',
              details: 'Two days, one night under the stars. Tents provided. Limited spots!',
              event: { in: 21, title: 'Cedars Camping Weekend', start: '08:00', end: '18:00', place: 'Arz Bsharri', max: 25, price: 45,
                       lat: 34.2436, lng: 36.0489 } },
            { ago: 220, image: 'hiking-cablecar', title: 'Photos from the Harissa trip are up',
              details: 'Thanks to the 40 of you who joined. Tag yourselves!' },
        ],
    },
    {
        crn: 2105, title: 'Book Club', email: 'book.club@mail.aub.edu', logo: 'books-logo', cabinet: 'lhaddad',
        bio: 'One book a month, one cozy discussion. Fiction, non-fiction, poetry: we read it all.',
        posts: [
            { ago: 20, image: 'books-swap', title: 'Book swap on the Green Oval',
              details: 'Bring a book you loved, leave with one you have never read.',
              event: { in: 7, title: 'Book Swap', start: '12:00', end: '15:00', place: 'Green Oval', max: 80, price: 0 } },
            { ago: 88, image: 'books-pages', title: 'This month we are reading "The Prophet"',
              details: 'Khalil Gibran\'s classic. Discussion on the last Thursday of the month in Jafet Library.' },
            { ago: 150, image: 'books-typewriter', title: 'Creative writing workshop',
              details: 'Short prompts, short stories, friendly feedback. No experience needed.',
              event: { in: 14, title: 'Creative Writing Workshop', start: '17:30', end: '19:30', place: 'Jafet Library, Room 101', max: 20, price: 0 } },
        ],
    },
    {
        crn: 2106, title: 'Food & Culture Society', email: 'food.culture@mail.aub.edu', logo: 'food-logo', cabinet: 'naziz',
        bio: 'Cooking classes, coffee tastings and food from every corner of the world.',
        posts: [
            { ago: 2, image: 'food-nightmarket', title: 'International Night Market',
              details: 'Food stalls from 15 student societies, live music and games. Bring friends and an empty stomach!',
              event: { in: 10, title: 'International Night Market', start: '18:00', end: '23:00', place: 'Green Oval', max: 500, price: 0 } },
            { ago: 46, image: 'food-brew', title: 'Coffee brewing masterclass',
              details: 'V60, Chemex, AeroPress and Lebanese coffee side by side. Learn what makes each one different.',
              event: { in: 8, title: 'Coffee Brewing Masterclass', start: '16:00', end: '18:00', place: 'College Hall, Room B1', max: 20, price: 8 } },
            { ago: 120, image: 'food-cooking', title: 'Healthy cooking on a student budget',
              details: 'Five recipes under 5 dollars each. Recipes and a shopping list are pinned on our page.' },
            { ago: 180, image: 'food-social', title: 'Welcome social recap',
              details: 'Thank you for coming! Our next social is announced soon, so follow us to see it first.' },
        ],
    },
];

// Who follows which clubs. The demo account follows four clubs, so the other two can be found in Discover.
const follows = {
    demo: [2101, 2102, 2103, 2104],
    mkhoury: [2102, 2105, 2106],
    ksaad: [2101, 2103],
    lhaddad: [2105, 2106, 2102],
    ofarah: [2103, 2104, 2101],
    naziz: [2106, 2104],
};

// Comments: [club crn, post index, username, text]
const comments = [
    [2101, 0, 'ksaad', 'Already have a team of three, looking for a designer!'],
    [2101, 0, 'ofarah', 'Is it okay to come as a complete beginner?'],
    [2101, 0, 'demo', 'Can\'t wait for this one.'],
    [2101, 2, 'lhaddad', 'I would love to join the study group.'],
    [2102, 0, 'lhaddad', 'Bringing my phone and my best sunset playlist.'],
    [2102, 1, 'mkhoury', 'We have six cameras to lend, first come first served.'],
    [2103, 0, 'ksaad', 'Signing up with my ukulele.'],
    [2103, 1, 'demo', 'Got my ticket!'],
    [2104, 0, 'naziz', 'Is lunch included or should we bring our own?'],
    [2104, 0, 'ofarah', 'Bring your own lunch, there is a nice picnic spot halfway.'],
    [2105, 1, 'mkhoury', 'One of my favourite books.'],
    [2106, 0, 'lhaddad', 'The best night of the semester, every year.'],
    [2106, 1, 'mkhoury', 'Will there be decaf for the evening people?'],
];

// Likes: every student likes a deterministic subset of the posts of the clubs they follow.
function likesFor(username, crn, postIndex){
    return (username.length + crn + postIndex * 3) % 3 !== 0;
}

// Event registrations: [club crn, post index, username]
const registrations = [
    [2101, 0, 'ksaad'], [2101, 0, 'ofarah'], [2101, 1, 'demo'], [2101, 1, 'lhaddad'],
    [2102, 0, 'lhaddad'], [2102, 0, 'demo'], [2102, 1, 'mkhoury'],
    [2103, 0, 'ksaad'], [2103, 0, 'demo'], [2103, 1, 'ofarah'],
    [2104, 0, 'demo'], [2104, 0, 'naziz'], [2104, 0, 'ofarah'], [2104, 2, 'ofarah'],
    [2105, 0, 'mkhoury'], [2105, 2, 'lhaddad'],
    [2106, 0, 'lhaddad'], [2106, 0, 'naziz'], [2106, 1, 'mkhoury'],
];


function dateInDays(days){
    const d = new Date(Date.now() + days * 86400000);
    return d.toISOString().slice(0, 10);
}

function copyImage(name){
    const file = `seed-${name}.jpg`;
    fs.copyFileSync(path.join(imagesDir, `${name}.jpg`), path.join(compressedDir, file));
    // Relative URL: works on any domain, since the server serves /compressed next to the frontend.
    return `/compressed/${file}`;
}

async function main(){
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    fs.mkdirSync(compressedDir, { recursive: true });

    const usernames = students.map(s => s.username);
    const crns = clubs.map(c => c.crn);

    // ---- Remove the previous demo data (children first, because of foreign keys) ----
    const [oldEvents] = await db.query('SELECT event_id FROM club_events WHERE club_crn IN (?)', [crns]);
    const oldEventIds = oldEvents.map(e => e.event_id);
    if (oldEventIds.length) await db.query('DELETE FROM event_participants WHERE event_id IN (?)', [oldEventIds]);
    await db.query('DELETE FROM event_participants WHERE username IN (?)', [usernames]);
    await db.query('DELETE FROM club_events WHERE club_crn IN (?)', [crns]);
    await db.query('DELETE FROM posts WHERE club_crn IN (?)', [crns]);       // likes, comments, seen posts cascade
    await db.query('DELETE FROM clubs WHERE crn IN (?)', [crns]);            // followers cascade
    await db.query('DELETE FROM verification_tokens WHERE username IN (?)', [usernames]);
    await db.query('DELETE FROM passreset_tokens WHERE username IN (?)', [usernames]);
    await db.query('DELETE FROM users WHERE username IN (?)', [usernames]);  // their likes, comments, follows cascade

    // ---- Students (all verified; the demo account has a known password, the others a random one) ----
    for (const s of students){
        const password = s.username === 'demo' ? DEMO_STUDENT.password : `${Math.random().toString(36)}!Aa1`;
        await db.query(
            'INSERT INTO users (username, firstname, familyname, email, bio, password_hash, verified) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [s.username, s.firstname, s.familyname, `${s.username}@mail.aub.edu`, s.bio, await bcrypt.hash(password, 10)]);
    }

    // ---- Clubs, posts and events ----
    const clubPasswordHash = await bcrypt.hash(DEMO_CLUB_PASSWORD, 10);
    const postIds = {}; // `${crn}:${index}` -> post_id

    for (const club of clubs){
        await db.query('INSERT INTO clubs (crn, password_hash, title, bio, email, profile_pic_url) VALUES (?, ?, ?, ?, ?, ?)',
            [club.crn, clubPasswordHash, club.title, club.bio, club.email, copyImage(club.logo)]);

        for (const [index, post] of club.posts.entries()){
            const [result] = await db.query(
                'INSERT INTO posts (club_crn, posted_by, title, details, image_url, is_event, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW() - INTERVAL ? HOUR)',
                [club.crn, club.cabinet, post.title, post.details, copyImage(post.image), post.event ? 1 : 0, post.ago]);
            postIds[`${club.crn}:${index}`] = result.insertId;

            if (post.event){
                const e = post.event;
                await db.query(
                    `INSERT INTO club_events (event_id, club_crn, event_title, event_details, event_max_participation, event_ticket_price,
                     event_exclusive, event_date, event_startTime, event_endTime, event_location_name, event_location_latitude, event_location_longitude)
                     VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?)`,
                    [result.insertId, club.crn, e.title, post.details, e.max, e.price, dateInDays(e.in), e.start, e.end, e.place,
                     e.lat ?? campus.lat, e.lng ?? campus.lng]);
            }
        }
    }

    // ---- Follows, likes, comments, registrations ----
    for (const [username, followed] of Object.entries(follows)){
        for (const [i, crn] of followed.entries()){
            await db.query('INSERT INTO club_followers (club_crn, username, follow_date) VALUES (?, ?, NOW() - INTERVAL ? DAY)', [crn, username, 20 - i]);

            const club = clubs.find(c => c.crn === crn);
            for (const index of club.posts.keys()){
                if (likesFor(username, crn, index)){
                    await db.query('INSERT INTO post_likes (post_id, username) VALUES (?, ?)', [postIds[`${crn}:${index}`], username]);
                }
            }
        }
    }

    for (const [i, [crn, index, username, text]] of comments.entries()){
        const hoursAgo = clubs.find(c => c.crn === crn).posts[index].ago - 1 - (i % 3) * 0.25;
        await db.query('INSERT INTO post_comments (post_id, username, comment_text, created_at) VALUES (?, ?, ?, NOW() - INTERVAL ? MINUTE)',
            [postIds[`${crn}:${index}`], username, text, Math.max(1, Math.round(hoursAgo * 60))]);
    }

    for (const [crn, index, username] of registrations){
        await db.query('INSERT INTO event_participants (event_id, username) VALUES (?, ?)', [postIds[`${crn}:${index}`], username]);
    }

    await db.end();

    const postCount = clubs.reduce((n, c) => n + c.posts.length, 0);
    console.log(`Demo data ready: ${students.length} students, ${clubs.length} clubs, ${postCount} posts, ${comments.length} comments, ${registrations.length} registrations.`);
    console.log(`  Student login: ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password}`);
    console.log(`  Club login:    same email and password, CRN 2101 (${clubs[0].title}), club password ${DEMO_CLUB_PASSWORD}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
