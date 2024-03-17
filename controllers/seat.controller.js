const { request } = require('../routes/user.route')

const seatModel = require('../models/index').seat
const eventModel = require('../models/index').event
const Op = require('sequelize').Op

/** create function for filter */
exports.findSeat = async (request, response) => {

    /** define keyword to find data */
    let keyword = request.params.key

    let seats = await seatModel.findAll({
        where: {
            [Op.or]: [
                { eventID: { [Op.substring]: keyword } }
            ]
        }
    })
    return response.json({
        success: true,
        data: seats,
        message: `All Events have been loaded`
    })
}

/** create function for filter */
exports.findEvent = async (request, response) => {

    /** define keyword to find data */
    let keyword = request.params.key

    /** call findAll() within where clause and operation
     * to find data based on keyword */
    let events = await eventModel.findAll({
        where: {
            [Op.or]: [
                { eventName: { [Op.substring]: keyword } },
                { eventDate: { [Op.substring]: keyword } },
                { venue: { [Op.substring]: keyword } },
                { price: { [Op.substring]: keyword } }
            ]
        }
    })
    return response.json({
        success: true,
        data: events,
        message: `All Events have been loaded`
    })
}

/** create function for read all data */
exports.getAllSeat = async (request, response) => {

    /** call findAll() to get all data */
    let seats = await seatModel.findAll()

    return response.json({
        success: true,
        data: seats,
        message: `All seats have been loaded`
    })
}

exports.addSeat = async (request, response) => {
  // Ambil data dari request body
  let eventID = request.body.eventID;
  eventID = parseInt(eventID);

  try {
      // Cari event dengan eventID yang diberikan
      const event = await eventModel.findOne({ where: { eventID: eventID } });

      if (!event) {
          return response.json({
              success: false,
              message: `Event with ID ${eventID} does not exist.`
          });
      }

      // Jika eventID ditemukan, tambahkan seat ke tabel seat
      let newSeat = {
          eventID: eventID,
          rowNum: request.body.rowNum,
          seatNum: parseInt(request.body.seatNum), // Mengubah seatNum menjadi integer
          status: request.body.status === 'true' ? 1 : 0, // Mengubah status menjadi boolean (true/false)
      };

      // Cari atau buat seat baru
      const [seat, created] = await seatModel.findOrCreate({
          where: { eventID: eventID, rowNum: newSeat.rowNum, seatNum: newSeat.seatNum },
          defaults: newSeat
      });

      if (created) {
          // Jika seat baru berhasil dibuat
          return response.json({
              success: true,
              data: seat,
              message: `New seat has been inserted for event ${eventID}.`
          });
      } else {
          // Jika seat dengan kombinasi eventID, rowNum, dan seatNum sudah ada
          return response.json({
              success: false,
              message: `Seat already exists for event ${eventID}, rowNum ${newSeat.rowNum}, and seatNum ${newSeat.seatNum}.`
          });
      }
  } catch (error) {
      // Jika terjadi kesalahan
      console.error(error);
      return response.json({
          success: false,
          message: error.message
      });
  }
}


exports.updateSeat = (request, response) => {
    let seatID = request.params.id;
    if (!seatID) {
        return response.status(400).json({
            success: false,
            message: "Seat ID is required"
        });
    }

    let dataSeat = {
        rowNum: request.body.rowNum,
        seatNum: request.body.seatNum,
        status: request.body.status ? 1 : 0,
    }

    /** execute update data based on defined id user */
    seatModel.update(dataSeat, { where: { seatID: seatID } })
        .then(result => {
            /** if update's process success */
            return response.json({
                success: true,
                message: `Data seat has been updated`
            });
        })
        .catch(error => {
            /** if update's process fail */
            return response.status(500).json({
                success: false,
                message: error.message
            });
        });
}

/** create function to delete seat */
exports.deleteSeat = (request, response) => {
    let seatID = request.params.id
    seatModel.destroy({ where: { seatID: seatID } })
        .then(result => {
            /** if update's process success */
            return response.json({
                success: true,
                message: `Seat data has been deleted`
            })
        })
        .catch(error => {
            /** if update's process fail */
            return response.json({
                success: false,
                message: error.message
            })
        })
}


function createAutoSeats(rows, columns) {
    const autoCreatedSeats = [];

    for (let i = 1; i <= columns; i++) {
        autoCreatedSeats.push({
            rowNum: rows,
            seatNum: i
        });
    }

    return autoCreatedSeats;
}

exports.autoSeat = async (request, response) => {
    try {
        const { eventID, rows, columns, autoCreate } = request.body;

        if (!eventID) {
            return response.json({ 
                success: false,
               message : "Event ID is invalid"
            });
        }
        // Check if autoCreate is true
        if (autoCreate) {
            // Check if columns are specified
            if (!columns) {
                return response.json({
                    success: false,
                    message: "Columns must be specified for autoCreate."
                });
            }

            const autoCreatedSeats = createAutoSeats(rows, parseInt(columns));

            // Create seat records for auto-created seats
            const seats = await seatModel.bulkCreate(autoCreatedSeats.map(seat => ({
                eventID,
                rowNum: seat.rowNum,
                seatNum: seat.seatNum,
                status: "true"
            })));

            return response.status(201).json({
                success: true,
                data: seats,
                message: "Auto-created seats successfully added."
            });
        }

        return response.json({
            success: false,
            message: "Invalid request for seat creation."
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.deleteArround = async (req, res) => {
    try {
        const { startId, endId } = req.body;

        // Ensure startId and endId are integers
        const start = parseInt(startId);
        const end = parseInt(endId);

        if (isNaN(start) || isNaN(end)) {
            return res.json({
                success: false,
                message: 'Invalid startId or endId.'
            });
        }

        // Use Promise.all to wait for all destroy operations to complete
        const deletionPromises = [];

        for (let i = start; i <= end; i++) {
            deletionPromises.push(
                seatModel.destroy({ where: { seatID: i } })
            );
        }

        await Promise.all(deletionPromises);

        return res.json({
            success: true,
            message: `Seats data has been deleted`
        });

    } catch (err) {
        console.log("Error in deleteArround function");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};