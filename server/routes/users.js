const express = require("express");
const usersController = require("../controllers/usersController");

const router = express.Router();

router
  .route("/")
  .get(usersController.getUsers)
  .post(usersController.createUser)
  .delete(usersController.deleteAllUsers);

router
  .route("/:id")
  .get(usersController.getUserById)
  .patch(usersController.updateUser)
  .put(usersController.replaceUser)
  .delete(usersController.deleteUser);

module.exports = router;
