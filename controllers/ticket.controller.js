const seatModel = require(`../models/index`).seat
const userModel = require(`../models/index`).user
const eventModel = require(`../models/index`).event
const ticketModel = require(`../models/index`).ticket
const sequelize = require(`sequelize`)
const Op = require(`sequelize`).Op

/** create function for add new ticket */
exports.addTicket = async (request, response) => {
    /** prepare date for bookedDate */
    const today = new Date()

    const bookedDate = `${today.getFullYear()}-
                        ${today.getMonth() + 1}-${today.getDate()}-
                        ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`

    /** prepare data from request */
    const { eventID, userID, seats } = request.body;

    try {
        // Create seat records for the chosen seats
        const seatIDs = await Promise.all(seats.map(async seat => {
            const { rowNum, seatNum } = seat;
            const createdSeat = await seatModel.create({
                eventID,
                rowNum,
                seatNum,
                status: 'true'
            });
            return createdSeat.seatID;
        }));

        // Create ticket records associating the chosen seats
        const tickets = await
            ticketModel.bulkCreate(seatIDs.map(seatID => ({
                eventID,
                userID,
                seatID,
                bookedDate
            })));
        response.status(201).json(tickets);
    }
    catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function for read all data */
exports.getAllTicket = async (request, response) => {
    /** call findAll() to get all data */
    let tickets = await ticketModel.findAll(
        {
            include: [
                { model: eventModel, attributes:
                        ['eventName','eventDate','venue']},
                { model: userModel, attributes: ['firstName',
                        'lastName']},
                { model: seatModel, attributes: ['rowNum',
                        'seatNum']},
            ]
        }
    )
    return response.json({
        success: true,
        data: tickets,
        message: `All tickets have been loaded`
    })
}

/** create function for filter ticket by ID */
exports.ticketByID = async (request, response) => {
    /** define ticketID to find data */
    let ticketID = request.params.id
    /** call findAll() within where clause and operation
     * to find data based on ticketID */
    let tickets = await ticketModel.findAll({
        where: {
            ticketID: { [Op.substring]: ticketID }
        },
        include: [
            { model: eventModel, attributes:
                    ['eventName','eventDate','venue']},
            { model: userModel, attributes: ['firstName',
                    'lastName','email']},
            { model: seatModel, attributes: ['rowNum',
                    'seatNum']},
        ]
    })
    return response.json({
        success: true,
        data: tickets,
        message: `All tickets have been loaded`
    })
}


exports.getMyTickets = async (request, response) => {
    try {
        
        const userID = request.user.userID; 
  
        const tickets = await ticketModel.findAll({
            where: {
                userID: userID
            },
            include: [
                {
                    model: eventModel,
                    attributes: ['eventName', 'eventDate', 'venue']
                },
                {
                    model: userModel,
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: seatModel,
                    attributes: ['rowNum', 'seatNum']
                },
            ]
        });
  
        return response.json({
            success: true,
            data: tickets,
            message: `Tickets for the logged-in user have been loaded`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
  };

exports.getTiketByEvent = async (request, response) => {
    try {
        // Query untuk mendapatkan jumlah tiket terjual untuk masing-masing event
        const soldTicketsByEvent = await ticketModel.findAll({
            attributes: ['eventID', [sequelize.fn('COUNT', sequelize.col('ticket.eventID')), 'soldTickets']],
            group: ['eventID'],
            include: [
                { model: eventModel, attributes: ['eventName', 'eventDate', 'venue'] },
            ]
        });

        return response.json({
            success: true,
            data: soldTicketsByEvent,
            message: `Number of sold tickets for each event has been loaded`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

exports.getTop5SellingEvents = async (request, response) => {
    try {
        // Ambil tanggal sekarang untuk mencari event yang masih berlangsung
        const currentDate = new Date();

        // Query untuk mendapatkan 5 event dengan penjualan terbanyak yang masih berlangsung
        const topSellingEvents = await ticketModel.findAll({
            attributes: ['eventID', [sequelize.fn('COUNT', sequelize.col('ticket.eventID')), 'soldTickets']],
            where: {
                '$event.eventDate$': { [Op.gte]: currentDate } // Hanya event yang masih berlangsung
            },
            group: ['eventID'],
            include: [
                {
                    model: eventModel,
                    attributes: ['eventID', 'eventName', 'eventDate', 'venue'],
                    where: {
                        eventDate: { [Op.gte]: currentDate } // Hanya event yang masih berlangsung
                    },
                },
            ],
            order: [[sequelize.literal('soldTickets'), 'DESC']],
            limit: 5,
        });

        return response.json({
            success: true,
            data: topSellingEvents,
            message: 'Top 5 selling events have been loaded',
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message,
        });
    }
};