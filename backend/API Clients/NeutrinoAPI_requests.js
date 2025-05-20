import dotenv from "dotenv";

dotenv.config({path: '../../../.env'});

export async function checkprofanity(text){

    const params = {
        "content": text,
        "catalog": "strict",
        "censor-character": "*"
    }

    const url = "https://neutrinoapi.net/bad-word-filter";

    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'User-id': process.env.NEUTRINO_USER_ID,
            'API-Key': process.env.NEUTRINO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        return {success: true, data: data};
    })
    .catch(error => {
        console.error("Error while fetching from neutrino api: " + url);
        return {success: false, error: error};
    })

}