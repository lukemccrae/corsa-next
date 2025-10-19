export const retrieveUserToken = (): string => {
   let token = localStorage.getItem("user")
    if (token && typeof token === 'string') {
        return token;
    } else {
        return ""
    }
}