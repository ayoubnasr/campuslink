function sanitizeSearchInput(input) {
    // Trim whitespace and replace spaces with plus signs
    const sanitizedInput = input.trim().replace(/\s+/g, '+');
    
    // Encode the sanitized input to escape special characters
    const encodedInput = encodeURIComponent(sanitizedInput);
    
    return encodedInput;
}


export async function request_location_from_nominatim(search_input){

    const sanitized_LocationInput = sanitizeSearchInput(search_input);

    const nominatimEndpoint = `https://nominatim.openstreetmap.org/search?q=${sanitized_LocationInput}&format=json&addressdetails=1`;


    return fetch(nominatimEndpoint)
    .then(response => response.json())
    .then(data => {
        return {success: true, data: data};
    })
    .catch(error => {
        console.error("Location fetch from nominatim failed:", error);
        return {success: false, message: "Error while fetching location from nominatim API.", error: error};
    });

}