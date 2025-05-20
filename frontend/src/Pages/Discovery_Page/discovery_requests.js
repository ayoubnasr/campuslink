

export async function request_get_accounts(search_phrase){
    
    const serverDomain = process.env.REACT_APP_DISCOVERY_URL;

    return fetch(`${serverDomain}/search-accounts?type=byTitle&search=${encodeURIComponent(search_phrase)}`, {
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
        console.error("Error while fetching search results from " + serverDomain);
        return {success: false, error: error};
    })

}

export async function request_follow_account(club_crn_input){
    
    const serverDomain = process.env.REACT_APP_DISCOVERY_URL;

    return fetch(`${serverDomain}/follow`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ club_crn: club_crn_input })
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Error while requesting /follow route from " + serverDomain);
        return {success: false, message: "Error while requesting /follow route from " + serverDomain, error: error};
    })

}