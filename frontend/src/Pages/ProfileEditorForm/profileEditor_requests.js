export async function request_update_club_profile(formData){

    const serverDomain = process.env.REACT_APP_CABINET_URL;

    return fetch(`${serverDomain}/edit-club-details`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Editing club profile failed:", error);
        return {success: false, message: "Error while fetching from edit-club-details route.", error: error};
    });

}