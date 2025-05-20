
export async function get_user_authorization_info(){

    const serverDomain = process.env.REACT_APP_USER_URL;

    return fetch(`${serverDomain}/get-user-auth-info`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Requesting user authorization info failed:", error);
        return {success: false, message: "Error while fetching user authorization info.", error: error};
    });

}

export async function getUserFeed (pagenumber){

    const serverDomain = process.env.REACT_APP_FYP_URL;

    return fetch(`${serverDomain}/feed?page=${pagenumber}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {

        if (data.feed){
            return {success: true, feed: data.feed};
        }
        else {
            return {success: false, message: data.message};
        }
    })
    .catch(error => {
        console.error("Error while fetching from route: " + serverDomain);
        return {success: false, error: error};
    })


}

export async function get_user_profile(){

    const serverDomain = process.env.REACT_APP_USER_URL;


    return fetch(`${serverDomain}/get-user-profile`, {
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
        console.error("User profile fetch failed:", error);
        return {success: false, message: "User profile fetch failed.", error: error};
    });

}

export async function get_club_profile(){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/get-club-profile`, {
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

export async function get_club_posts(){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/get-club-posts`, {
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