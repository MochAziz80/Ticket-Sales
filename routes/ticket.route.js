
const express = require(`express`)
const app = express()

app.use(express.json())
const ticketController = require(`../controllers/ticket.controller`)
const { validateUser } = require("../middlewares/user-validation")
const jwtControl = require(`../controllers/auth.controller`)
app.get("/myTicket", jwtControl.authenticateJWT, ticketController.getMyTickets)
app.get("/event", ticketController.getTiketByEvent)
app.get("/top", ticketController.getTop5SellingEvents)
app.post("/", ticketController.addTicket)
app.get("/", ticketController.getAllTicket)
app.get("/:id", ticketController.ticketByID)

module.exports = app