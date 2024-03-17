/** load library express */
const express = require(`express`)
/** initiate object that instance of express */
const app = express()
app.use(express.json())
const eventController =
require(`../controllers/event.controller`)
const { authorize } = require('../controllers/auth.controller')
const { IsAdmin } = require('../middlewares/role-validation')

app.get("/", eventController.getAllEvent)
app.get("/:key", eventController.findEvent)
app.post("/", authorize, IsAdmin, eventController.addEvent)
app.put("/:id", eventController.updateEvent)
app.delete("/:id", eventController.deleteEvent)

module.exports = app