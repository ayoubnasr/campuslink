
export function requestLogin(email, password){
    
    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;

    console.log(serverDomain);

    const request = {
        email: email,
        password: password
    }

    return fetch(`${serverDomain}/login-user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    .then(response => response.json())
    .then(data => {

        return data;
    })
    .catch(error => {
        console.error("Error while fetching from login route: " + serverDomain);
        return {success: false, error: error};
    })

}

export function requestClubLogin(user_email, user_password_input, club_crn_input, club_password_input){
    

    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;
    
    const username_input = user_email.substring(0, user_email.indexOf('@'));

    const request = {
        email: user_email,
        user_password: user_password_input,
        club_crn: club_crn_input,
        club_password: club_password_input
    }

    return fetch(`${serverDomain}/login-club`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    .then(response => response.json())
    .then(data => {

        return data;
    })
    .catch(error => {
        console.error("Error while fetching from login route: " + error);
        return {success: false, error: error};
    })

}

export function requestSignup(email, password) {
    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;
    const request = {
        email: email,
        password: password
    };

    return fetch(`${serverDomain}/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Signup request failed:", error);
        return {success: false, error: error};
    });
}


export function requestPassResetEmail(email_input){

    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;
    const request = {email: email_input};

    return fetch(`${serverDomain}/requestpassreset`, {

        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)

    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Password reset request failed: ", error);
        return {success: false, error: error};
    })

}


/**
 * 
 * @param {*} username_input 
 * @param {*} newpasshash_input 
 * @returns 
 */
export function requestPassReset(username_input, newpassword_input){

    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;

    const request = {
        username: username_input,
        newpassword: newpassword_input
    };

    return fetch(`${serverDomain}/passreset`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Password-reset request failed:", error);
        return {success: false, error: error};
    });
}


export async function requestLogout (){

    const serverDomain = process.env.REACT_APP_AUTHENTICATION_URL;

    return fetch(`${serverDomain}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {

        return {success: data.success, message: data.message};
    })
    .catch(error => {
        console.error("Error while fetching from route: " + serverDomain);
        return {success: false, error: error};
    })


}