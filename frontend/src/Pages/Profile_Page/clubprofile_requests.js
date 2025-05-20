export async function get_club_profile(target_club_crn){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/get-club-profile?club_crn=${target_club_crn}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Club profile fetch failed:", error);
        return {success: false, error: error};
    });

}

export async function get_club_posts(target_club_crn){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/get-club-posts?club_crn=${target_club_crn}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Club posts fetch failed:", error);
        return {success: false, error: error};
    });

}

export async function get_event_participants(event_id){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/get-event-participants?event_id=${event_id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Fetching event participants failed:", error);
        return {success: false, error: error};
    });

}