
import { refreshDatabase } from './setDB.js';  // Named import

document.getElementById('refresh-database').addEventListener('click', () => {
    console.log("Button clicked");
    // Call the refreshDatabase function from setDatabase.js
    if (typeof refreshDatabase === 'function') {
        refreshDatabase();
    } else {
        console.error("refreshDatabase function is not defined.");
    }
});