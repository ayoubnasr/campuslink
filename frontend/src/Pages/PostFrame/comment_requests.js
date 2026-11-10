export async function get_post_comments(post_id){

    const serverDomain = process.env.REACT_APP_FYP_URL;

    return fetch(`${serverDomain}/comments?post_id=${encodeURIComponent(post_id)}`, {
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
        console.error("Loading comments failed:", error);
        return {success: false, error: error};
    });

}

export async function add_post_comment(post_id, comment){

    const serverDomain = process.env.REACT_APP_FYP_URL;

    return fetch(`${serverDomain}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({post_id: post_id, comment: comment})
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error("Adding comment failed:", error);
        return {success: false, error: error};
    });

}
