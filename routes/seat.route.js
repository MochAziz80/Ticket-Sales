const express = require('express')
const app = express()
app.use(express.json())
const seatController =  require('../controllers/seat.controller')

app.get("/", seatController.getAllSeat)

app.post("/", seatController.addSeat)

app.put("/:id", seatController.updateSeat)

app.delete("/erase", seatController.deleteArround)

app.delete("/:id", seatController.deleteSeat)

app.get("/:key", seatController.findSeat)

app.post("/auto", seatController.autoSeat)

module.exports = app