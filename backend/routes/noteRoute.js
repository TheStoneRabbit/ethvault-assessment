const express = require("express");
const {
  validateCreateNote,
  validateUpdateNote,
  validateNoteIdParam,
} = require("../middlewares/validator");
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const router = express.Router();

router
  .route("/")
  .post(validateCreateNote, createNote)
  .get(getNotes);

router
  .route("/:id")
  .all(validateNoteIdParam)
  .get(getNoteById)
  .put(validateUpdateNote, updateNote)
  .delete(deleteNote);

module.exports = router;
