const express = require(`express`)

const app = express()

app.use(express.json())

const { validateUser } = require("../middlewares/user-validation")

const userController =require(`../controllers/user.controller`)

const { authorize } = require('../controllers/auth.controller')

const {IsUser, IsAdmin} = require('../middlewares/role-validation')

app.post("/", validateUser, userController.addUser)

app.put("/:id", validateUser, userController.updateUser)

const { midOne } = require("../middlewares/simple-middleware")

app.get("/:key", [midOne], userController.findUser)

app.post("/", userController.addUser)

app.put("/:id", userController.updateUser)

app.delete("/:id", userController.deleteUser)

app.post("/reset/:id", userController.resetPassword)

app.post('/register', userController.registerUser);

app.get("/", authorize, IsAdmin, userController.getAllUser)

app.get("/:key", authorize, IsAdmin, userController.findUser)

app.post("/", authorize, IsAdmin, validateUser, userController.addUser)

app.put("/:id", authorize, IsUser, validateUser, userController.updateUser)

app.delete("/:id", authorize, IsAdmin, userController.deleteUser)



app.get("/", [midOne], userController.getAllUser)


module.exports = app