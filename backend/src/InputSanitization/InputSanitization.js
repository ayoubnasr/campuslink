/**
 * This function returns true if input is safe and false if input contains any unwanted characters.
 * @param {*} input 
 */
export function isValidInput(input){

    const searchTitleRegex = /^[a-zA-Z0-9\s]+$/;  // Only allows letters, numbers, and spaces

    if (!searchTitleRegex.test(input)) {
        return false;
    }

    return true;

}