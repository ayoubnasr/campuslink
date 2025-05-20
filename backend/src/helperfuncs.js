export function getUsername_from_email(email){

    const username = email.substring(0, email.indexOf('@'));

    return username;

}

export function isValidAUBEmail (email) {
    
    const usernameMinLen = 2;

    const invalidEmailSymbols = [
        '(', ')', '[', ']', '{', '}', '<', '>', 
        ',', ';', ':', '\\', '"', ' ', '/', '?',
        '!', '#', '$', '%', '^', '&', '*', '+',
        '=', '|', '`', '~'
      ];

    const containsInvalidSymbol = invalidEmailSymbols.some(symbol => email.includes(symbol));

    return !containsInvalidSymbol && email.endsWith("@mail.aub.edu") && email.indexOf("@") === email.lastIndexOf("@") 
    && email.indexOf("@") > usernameMinLen;
}

export function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

export function isValidAUBClubCRN (crn_string) {
    
    return crn_string.length > 0 && crn_string.length <= 4;
}
  