const userModel = require(`../models/index`).user
const md5 = require(`md5`)
const crypto = require('crypto');
const Op = require(`sequelize`).Op

exports.getAllUser = async (request, response) => {
    let users = await userModel.findAll()
    return response.json({
        success: true,
        data: users,
        message: `All users have been loaded`
    })
}

exports.findUser = async (request, response) => {
    let keyword = request.params.key

    let users = await userModel.findAll({
        where: {
            [Op.or]: [
                { userID: { [Op.substring]: keyword }},
                { firstname: { [Op.substring]: keyword }},
                { lastname: { [Op.substring]: keyword }},
                { email: { [Op.substring]: keyword }},
                { role: { [Op.substring]: keyword }}
            ]
        }
    })
    return response.json({
        success: true,
        data: users,
        message: `All Users have been loaded`
    })
}

exports.addUser = (request, response) => {
    let newUser = {
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        password: md5(request.body.password),
        role: request.body.role
    }
    userModel.create(newUser)
        .then(result => {
            return response.json({
                success: true,
                data: result,
                message: `New user has been inserted`
            })
        })
        .catch(error => {
            return response.json({
                success: false,
                message: error.message
            })
        })
}

exports.updateUser = (request, response) => {
    let dataUser = {
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        role: request.body.role
    }
    if (request.body.password) {
        dataUser.password = md5(request.body.password)
    }

    let userID = request.params.id

    userModel.update(dataUser, { where: { userID : userID } })
    .then(result => {
        return response.json({
            success: true,
            message: `Data user has been updated`
        })
    })
    .catch(error => {
        return response.json({
            success: false,
            message: error.message
        })
    })
}

exports.deleteUser = (request, response) => {
    let userID = request.params.id

    userModel.destroy({ where: { userID: userID } })
    .then(result => {
        return response.json({
            success: true,
            message: `Data user has been deleted`
        })
    })
    .catch(error => {
        return response.json({
            success: false,
            message: error.message
        })
    })
}

function generateRandomPassword() {
    // Generate a random password, for example, a 10-character alphanumeric password
    const length = 5;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        newPassword += characters.charAt(randomIndex);
    }

    return newPassword;
}

exports.resetPassword = async (request, response) => {
    const userID = request.params.id;
    const newPassword = generateRandomPassword();

    try {
        const user = await userModel.findOne({ where: { userID } });

        if (user) {
            const hashedPassword = md5(newPassword);
            await user.update({ password: hashedPassword });

            return response.json({
                success: true,
                message: `Password reset successful for user with ID ${userID}`,
                newPassword,
            });
        } else {
            return response.json({
                success: false,
                message: `User with ID ${userID} not found.`,
            });
        }
    } catch (error) {
        return response.json({
            success: false,
            message: error.message,
        });
    }
}

exports.registerUser = (request, response) => {

    userModel.findOne({ where: { email: request.body.email} })
        .then(existingUser => {
            if (existingUser) {
                return response.json({
                    success: false,
                    message: 'Email address is already registered.'
                });
            }

            // Jika email belum terdaftar, lanjutkan dengan registrasi
            let newUser = {
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                email: request.body.email,
                password: md5(request.body.password),
                role: request.body.role || 'user'
            };

            userModel.create(newUser)
                .then(result => {
                    return response.json({
                        success: true,
                        data: result,
                        message: 'New user has been registered.'
                    });
                })
                .catch(error => {
                    return response.json({
                        success: false,
                        message: error.message
                    });
                });
        })
        .catch(error => {
            return response.json({
                success: false,
                message: error.message
            });
        });
};
