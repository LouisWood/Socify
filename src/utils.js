/**
 * Fct d'ordre superieur (higher-order function)
 * Gestion des erreurs d'async/await
 * https://dmitripavlutin.com/javascript-higher-order-functions/
 * https://wesbos.com/javascript/12-advanced-flow-control/71-async-await-error-handling
 */

export const catchErrors = fn => {
    return function(...args) {
        return fn(...args).catch((err) => {
            console.error(err);
        })
    }
}

/**
 * ms -> min:second
 * @param {*} millis nombre de ms
 * @returns {string} 'min:scnd'
 * https://iqcode.com/code/javascript/convert-milliseconds-to-time-javascript
 */
export const msToMinScnd = millis => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}