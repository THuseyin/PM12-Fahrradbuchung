// setDB.js
export function refreshDatabase() {
    console.log("Refreshing the database...");
    var phpPath = './setDB.php';

    // Create an XMLHttpRequest to setDatabase via CSV
    const xhr = new XMLHttpRequest();
    xhr.open('GET', phpPath, true); 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    console.log('Database refreshed successfully.');
                } catch (error) {
                    console.error('Error occurred while handling response:', error);
                }
            } else {
                console.error('Database refresh failed, status code:', xhr.status, 'Status text:', xhr.statusText);
            }
        }
    };
    xhr.send(); 
}
