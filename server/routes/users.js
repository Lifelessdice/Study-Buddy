const express = require('express');
const {
  createUser,
  listUsers,
  getUser,
  patchUser,
  putUser,
  deleteUser,
  bulkDeleteUsers
} = require('../controllers/usersController');

const router = express.Router();

router.route('/')
  .post(createUser)
  .get(listUsers)
  .delete(bulkDeleteUsers);

router.route('/:id')
  .get(getUser)
  .patch(patchUser)
  .put(putUser)
  .delete(deleteUser);

module.exports = router;
