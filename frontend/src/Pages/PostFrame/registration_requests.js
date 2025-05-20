export async function register_user(target_event_id){

    const serverDomain = process.env.REACT_APP_USER_URL;


    return fetch(`${serverDomain}/register-user-event`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body:  JSON.stringify({event_id: target_event_id})
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Registration to event failed:", error);
        return {success: false, error: error};
    });

}

export async function unregister_user(target_event_id){

    const serverDomain = process.env.REACT_APP_USER_URL;


    return fetch(`${serverDomain}/unregister-user-event`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body:  JSON.stringify({event_id: target_event_id})
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Unregistering from event failed:", error);
        return {success: false, error: error};
    });

}