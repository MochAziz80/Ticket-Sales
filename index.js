const express = require(`express`)

const app = express()

const PORT = 8000

const cors = require(`cors`)

app.use(cors())

const userRoute = require(`./routes/user.route`)
const eventRoute = require(`./routes/event.route`)
const seatRoute = require(`./routes/seat.route`)
const ticketRoute = require(`./routes/ticket.route`)

const auth = require(`./routes/auth.route`)
app.use(`/user`, userRoute)
app.use(`/auth`, auth)
app.use(`/events`, eventRoute)
app.use(`/ticket`, ticketRoute)
app.use(`/seats`, seatRoute)

app.use(express.static(__dirname))

app.listen(PORT, () => {
    console.log(`Server of Ticket Sales runs on port ${PORT}`)
})