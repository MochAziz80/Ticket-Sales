/** load model for `events` table */
const eventModel = require(`../models/index`).event
/** load Operation from Sequelize */
const Op = require(`sequelize`).Op
/** load library 'path' and 'filestream' */
const path = require(`path`)
const fs = require(`fs`)


exports.getAllEvent = async (request, response) => {
    /** call findAll() to get all data */
    let events = await eventModel.findAll()
    return response.json({
        success: true,
        data: events,
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

const upload = require(`./upload-image`).single(`image`)

exports.addEvent = (request, response) => {
    /** run function upload */
    upload(request, response, async error => {
        /** check if there are error when upload */
        if (error) {
            return response.json({ message: error })
        }
        /** check if file is empty */
        
        let newEvent = {
            eventName: request.body.eventName,
            eventDate: request.body.eventDate,
            venue: request.body.venue,
            price: request.body.price,
           
        }

        if (request.file) {
            newEvent.image = request.file.filename;
        }

        /** execute inserting data to event's table */
        eventModel.create(newEvent)
            .then(result => {
                /** if insert's process success */
                return response.json({
                    success: true,
                    data: result,
                    message: `New event has been inserted`
                })
            })
            .catch(error => {
                /** if insert's process fail */
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

exports.updateEvent = async (request, response) => {
    /** run upload function */
    upload(request, response, async error => {
        /** check if there are error when upload */
        if (error) {
            return response.json({ message: error })
        }
        /** store selected event ID that will update */
        let eventID = request.params.id
        /** prepare event's data that will update */
        let dataEvent = {
            eventName: request.body.eventName,
            eventDate: request.body.eventDate,
            venue: request.body.venue,
            price: request.body.price,
        }
        /** check if file is not empty,
        * it means update data within reupload file
        */
        if (request.file) {
            /** get selected event's data */
            const selectedEvent = await eventModel.findOne({
                where: { eventID: eventID }
            })
            /** get old filename of image file */
            const oldImage = selectedEvent.image
            /** prepare path of old image to delete file */
            const pathImage = path.join(__dirname, `../image`,
                oldImage)
            /** check file existence */
            if (fs.existsSync(pathImage)) {
                /** delete old image file */
                fs.unlink(pathImage, error =>
                    console.log(error))
            }
            /** add new image filename to event object */
            dataEvent.image = request.file.filename
        }
        /** execute update data based on defined id event */
        eventModel.update(dataEvent, {
            where: {
                eventID:
                    eventID
            }
        })
            .then(result => {
                /** if update's process success */
                return response.json({
                    success: true,
                    message: `Data event has been updated`
                })
            })
            .catch(error => {
                /** if update's process fail */
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

exports.deleteEvent = async (request, response) => {
    /** store selected event's ID that will be delete */
    const eventID = request.params.id
    /** -- delete image file -- */
    /** get selected event's data */
    const event = await eventModel.findOne({
        where: {
            eventID:
                eventID
        }
    })
    /** get old filename of image file */
    const oldImage = event.image
    /** prepare path of old image to delete file */
    const pathImage = path.join(__dirname, `../image`,
        oldImage)
    /** check file existence */
    if (fs.existsSync(pathImage)) {
        /** delete old image file */
        fs.unlink(pathImage, error => console.log(error))
    }
    /** -- end of delete image file -- */
    /** execute delete data based on defined id event */
    eventModel.destroy({ where: { eventID: eventID } })
        .then(result => {
            /** if update's process success */
            return response.json({
                success: true,
                message: `Data event has been deleted`
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