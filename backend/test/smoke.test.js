/**
 * End-to-end smoke test: runs the main CampusLink flows against a running server and a real MySQL database.
 *
 *   BASE_URL=http://localhost:5000 npm test      (from backend/, with DB_* set in the environment or ../.env)
 *
 * Meant for a throwaway database (CI): it creates a test student, a test club and posts.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const id = Date.now().toString().slice(-6);
const student = { email: `smk${id}@mail.aub.edu`, username: `smk${id}`, password: 'Campus!Link#Smoke2025' };
const newPassword = 'Brand!New#Password2025';
const club = { crn: 1000 + (Number(id) % 9000), title: `Smoke Test Club ${id}`, password: 'Club!Pass#2025' };

let db;
let studentCookie;
let cabinetCookie;
let postId;
let eventId;

async function call(method, url, { body, cookie, form } = {}) {
    const headers = {};
    if (cookie) headers.Cookie = cookie;
    let payload;
    if (form) {
        payload = form;
    }
    else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }
    const res = await fetch(BASE + url, { method, headers, body: payload, signal: AbortSignal.timeout(10000) });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = undefined; }
    const setCookie = res.headers.getSetCookie().find(c => c.startsWith('authtoken='));
    return { status: res.status, json, text, cookie: setCookie ? setCookie.split(';')[0] : undefined };
}

before(async () => {
    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    // Clubs are created by admins directly in the database (there is no club sign-up), so the test does the same:
    await db.query('DELETE FROM clubs WHERE crn = ?', [club.crn]);
    await db.query('INSERT INTO clubs (crn, password_hash, title) VALUES (?, ?, ?)',
        [club.crn, await bcrypt.hash(club.password, 10), club.title]);
});

after(async () => {
    await db?.end();
});

test('health check: server and database are up', async () => {
    const r = await call('GET', '/api/health');
    assert.equal(r.status, 200);
});

test('bad requests get 4xx errors instead of crashing the server', async () => {
    assert.equal((await call('POST', '/api/auth/login-user', { body: { email: student.email } })).status, 400);
    assert.equal((await call('POST', '/api/auth/signup', { body: { email: student.email } })).status, 400);
    assert.equal((await call('GET', '/api/auth/verify')).status, 400);
    assert.equal((await call('POST', '/api/auth/login-club',
        { body: { email: student.email, user_password: 'x', club_crn: 'abcd', club_password: 'y' } })).status, 400);
    assert.equal((await call('GET', '/api/health')).status, 200, 'server should still be running');
});

test('student can sign up, verify their email and log in', async () => {
    const signup = await call('POST', '/api/auth/signup', { body: { email: student.email, password: student.password } });
    assert.equal(signup.status, 200, signup.text);

    const notVerified = await call('POST', '/api/auth/login-user', { body: { email: student.email, password: student.password } });
    assert.equal(notVerified.status, 401, 'login must fail before verification');

    const [rows] = await db.query('SELECT token FROM verification_tokens WHERE username = ?', [student.username]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].token.length, 40, 'verification token should be 40 hex characters');

    const verify = await call('GET', `/api/auth/verify?token=${rows[0].token}`);
    assert.equal(verify.status, 200, verify.text);

    const login = await call('POST', '/api/auth/login-user', { body: { email: student.email, password: student.password } });
    assert.equal(login.status, 200, login.text);
    assert.ok(login.cookie, 'login should set the auth cookie');
    assert.equal(login.json.jwt, undefined, 'the token must not be returned in the response body');
    studentCookie = login.cookie;
});

test('verification links expire, and a new one is sent (only) once the previous one has expired', async () => {
    const late = { email: `late${id}@mail.aub.edu`, username: `late${id}`, password: 'Late!Comer#2025', newPassword: 'Late!Comer#2026' };
    const tokens = async () => (await db.query('SELECT token FROM verification_tokens WHERE username = ?', [late.username]))[0].map(r => r.token);
    const expireLink = () => db.query('UPDATE verification_tokens SET expires_at = NOW() - INTERVAL 1 SECOND WHERE username = ?', [late.username]);
    const login = (password) => call('POST', '/api/auth/login-user', { body: { email: late.email, password } });

    assert.equal((await call('POST', '/api/auth/signup', { body: { email: late.email, password: late.password } })).status, 200);
    const [first] = await tokens();

    // While the link is still valid, logging in or signing up again doesn't send another one:
    const pending = await login(late.password);
    assert.equal(pending.status, 401);
    assert.equal(pending.json.errorCode, 'NOT VERIFIED');
    assert.match(pending.json.message, /minute/);
    assert.deepEqual(await tokens(), [first]);
    assert.equal((await call('POST', '/api/auth/signup', { body: { email: late.email, password: late.password } })).status, 429);
    assert.deepEqual(await tokens(), [first]);

    // A wrong password never triggers an email:
    await expireLink();
    assert.equal((await login('wrong-password')).status, 401);
    assert.deepEqual(await tokens(), [first]);

    // An expired link no longer works...
    assert.equal((await call('GET', `/api/auth/verify?token=${first}`)).status, 404);

    // ...and logging in with the right password sends a new one:
    const resent = await login(late.password);
    assert.equal(resent.status, 401);
    assert.match(resent.json.message, /new verification link/);
    const [second] = await tokens();
    assert.ok(second && second !== first, 'a new token should replace the expired one');

    // Signing up again after the link expired sends a new link and replaces the password:
    await expireLink();
    const again = await call('POST', '/api/auth/signup', { body: { email: late.email, password: late.newPassword } });
    assert.equal(again.status, 200, again.text);
    const [third] = await tokens();
    assert.ok(third && third !== second);

    assert.equal((await call('GET', `/api/auth/verify?token=${third}`)).status, 200);
    assert.equal((await login(late.password)).status, 401, 'the old password should no longer work');
    assert.equal((await login(late.newPassword)).status, 200);

    // Once verified, signing up again is refused:
    assert.equal((await call('POST', '/api/auth/signup', { body: { email: late.email, password: late.password } })).status, 409);
});

test('invalid verification token is rejected', async () => {
    const r = await call('GET', '/api/auth/verify?token=deadbeef');
    assert.equal(r.status, 404);
});

test('student can follow a club', async () => {
    const r = await call('POST', '/api/discovery/follow', { body: { club_crn: club.crn }, cookie: studentCookie });
    assert.equal(r.status, 200, r.text);

    const missing = await call('POST', '/api/discovery/follow', { body: {}, cookie: studentCookie });
    assert.equal(missing.status, 400);
});

test('club login: unknown CRN is refused, correct credentials work', async () => {
    const unknown = await call('POST', '/api/auth/login-club', { body: {
        email: student.email, user_password: student.password, club_crn: '0', club_password: club.password } });
    assert.equal(unknown.status, 401, unknown.text);

    const r = await call('POST', '/api/auth/login-club', { body: {
        email: student.email, user_password: student.password, club_crn: String(club.crn), club_password: club.password } });
    assert.equal(r.status, 200, r.text);
    assert.ok(r.cookie);
    cabinetCookie = r.cookie;
});

test('club can create an announcement and an event', async () => {
    const announcement = new FormData();
    announcement.append('post_obj', JSON.stringify({ post_title: 'Smoke test announcement', post_details: 'Hello campus!' }));
    const a = await call('POST', '/api/cabinet/createPost', { form: announcement, cookie: cabinetCookie });
    assert.equal(a.status, 200, a.text);

    const event = new FormData();
    event.append('post_obj', JSON.stringify({
        post_title: 'Smoke test event', post_details: 'Come along', is_event: 1,
        event_title: 'Smoke test event', event_details: 'Details', event_date: '2030-01-15',
        event_startTime: '18:00', event_endTime: '20:00', event_location_name: 'West Hall',
        event_max_participation: 50, event_ticket_price: 0,
    }));
    const e = await call('POST', '/api/cabinet/createPost', { form: event, cookie: cabinetCookie });
    assert.equal(e.status, 200, e.text);

    const badJson = new FormData();
    badJson.append('post_obj', '{not json');
    assert.equal((await call('POST', '/api/cabinet/createPost', { form: badJson, cookie: cabinetCookie })).status, 400);
});

test('posts appear in the follower\'s feed', async () => {
    const r = await call('GET', '/api/fyp/feed', { cookie: studentCookie });
    assert.equal(r.status, 200, r.text);
    const titles = r.json.feed.map(p => p.post_title);
    assert.ok(titles.includes('Smoke test announcement'), `feed was: ${JSON.stringify(titles)}`);
    postId = r.json.feed.find(p => p.post_title === 'Smoke test announcement').post_id;
});

test('comments can be added and loaded', async () => {
    const add = await call('POST', '/api/fyp/comment', { body: { post_id: postId, comment: 'Great post!' }, cookie: studentCookie });
    assert.equal(add.status, 200, add.text);

    const empty = await call('POST', '/api/fyp/comment', { body: { post_id: postId, comment: '   ' }, cookie: studentCookie });
    assert.equal(empty.status, 400);

    const list = await call('GET', `/api/fyp/comments?post_id=${postId}`, { cookie: studentCookie });
    assert.equal(list.status, 200, list.text);
    assert.equal(list.json.comments.length, 1);
    assert.equal(list.json.comments[0].comment_text, 'Great post!');
});

test('likes don\'t leak database connections (more likes than the pool size)', async () => {
    for (let i = 0; i < 15; i++) {
        const r = await call('POST', '/api/fyp/interaction', { body: { post_id: postId, interaction: { isLike: true } }, cookie: studentCookie });
        assert.equal(r.status, 200, `like #${i + 1}: ${r.text}`);
    }
    // Odd number of toggles -> the post ends up liked exactly once:
    const [rows] = await db.query('SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?', [postId]);
    assert.equal(rows[0].n, 1);
    assert.equal((await call('GET', '/api/health')).status, 200);
});

test('event registration shows up in the club\'s participant list and count', async () => {
    const posts = await call('GET', `/api/cabinet/get-club-posts?club_crn=${club.crn}`, { cookie: studentCookie });
    assert.equal(posts.status, 200, posts.text);
    const event = posts.json.posts.find(p => p.is_event);
    assert.ok(event, `no event in club posts: ${posts.text.slice(0, 300)}`);
    assert.equal(event.event_participant_count, 0);
    eventId = event.event_id;

    const reg = await call('POST', '/api/user/register-user-event', { body: { event_id: eventId }, cookie: studentCookie });
    assert.equal(reg.status, 200, reg.text);

    const participants = await call('GET', `/api/cabinet/get-event-participants?event_id=${eventId}`, { cookie: cabinetCookie });
    assert.equal(participants.status, 200, participants.text);
    assert.ok(participants.json.data.some(p => p.username === student.username));

    const again = await call('GET', `/api/cabinet/get-club-posts?club_crn=${club.crn}`, { cookie: studentCookie });
    assert.equal(again.json.posts.find(p => p.event_id === eventId).event_participant_count, 1);
});

test('password reset: request, open link, set new password, log in with it', async () => {
    const req = await call('POST', '/api/auth/requestpassreset', { body: { email: student.email } });
    assert.equal(req.status, 200, req.text);

    const [rows] = await db.query('SELECT token FROM passreset_tokens WHERE username = ?', [student.username]);
    assert.equal(rows.length, 1);
    const token = rows[0].token;

    const page = await call('GET', `/api/auth/passreset?token=${token}`);
    assert.equal(page.status, 200);
    assert.match(page.text, /<form/);

    const weak = await call('POST', '/api/auth/passreset', { body: { token, newpassword: '12345678' } });
    assert.equal(weak.status, 400, 'weak passwords must be refused');

    const reset = await call('POST', '/api/auth/passreset', { body: { token, newpassword: newPassword } });
    assert.equal(reset.status, 200, reset.text);

    const reused = await call('POST', '/api/auth/passreset', { body: { token, newpassword: newPassword } });
    assert.equal(reused.status, 404, 'a reset link can only be used once');

    const oldLogin = await call('POST', '/api/auth/login-user', { body: { email: student.email, password: student.password } });
    assert.equal(oldLogin.status, 401);

    const newLogin = await call('POST', '/api/auth/login-user', { body: { email: student.email, password: newPassword } });
    assert.equal(newLogin.status, 200, newLogin.text);
});

test('unknown email gets the same answer on password reset (no account lookup)', async () => {
    const r = await call('POST', '/api/auth/requestpassreset', { body: { email: 'nobody123@mail.aub.edu' } });
    assert.equal(r.status, 200);
});
