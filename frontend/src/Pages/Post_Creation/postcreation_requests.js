export async function request_create_club_post(formData){

    const serverDomain = process.env.REACT_APP_CABINET_URL;


    return fetch(`${serverDomain}/createPost`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Posts creation failed:", error);
        return {success: false, message: "Error while fetching from create-post route.", error: error};
    });

}