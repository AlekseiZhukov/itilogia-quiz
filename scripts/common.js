function checkUserData () {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData) {
        if ( !userData.name || !userData.lastName || !userData.email) {
            location.href = 'index.html';
        } else {
            return userData
        }
    }
    location.href = 'index.html';

}