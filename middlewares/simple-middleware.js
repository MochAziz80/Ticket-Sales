/** create first simple middleware */
const midOne = async (request, response, next) => {
    console.log(`Run Middleware One`)
    next() /** next() function used to continue to the
    controller process */
    }
    
    module.exports = {
        midOne
        }