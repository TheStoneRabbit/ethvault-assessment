const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const notesStore = require("../data/notesStore");

exports.createNote = asyncErrorHandler(async (req, res, next) => {
  const { title, body = "" } = req.body || {};

  if (!title) {
    return next(new ErrorHandler("Title is required", 400));
  }

  const timestamp = new Date().toISOString();
  const note = notesStore.createNote({
    title,
    body,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  res.status(201).json({
    success: true,
    note,
  });
});

exports.getNotes = asyncErrorHandler(async (req, res) => {
  const notes = notesStore.listNotes();

  res.status(200).json({
    success: true,
    notes,
  });
});

exports.getNoteById = asyncErrorHandler(async (req, res, next) => {
  const note = notesStore.findNote(req.params.id);

  if (!note) {
    return next(new ErrorHandler("Note not found", 404));
  }

  res.status(200).json({
    success: true,
    note,
  });
});

exports.updateNote = asyncErrorHandler(async (req, res, next) => {
  const { title, body } = req.body || {};

  if (title === undefined && body === undefined) {
    return next(new ErrorHandler("Nothing to update", 400));
  }

  const updates = { updatedAt: new Date().toISOString() };

  if (title !== undefined) {
    updates.title = title;
  }

  if (body !== undefined) {
    updates.body = body;
  }

  const note = notesStore.updateNote(req.params.id, updates);

  if (!note) {
    return next(new ErrorHandler("Note not found", 404));
  }

  res.status(200).json({
    success: true,
    note,
  });
});

exports.deleteNote = asyncErrorHandler(async (req, res, next) => {
  const deletedNote = notesStore.deleteNote(req.params.id);

  if (!deletedNote) {
    return next(new ErrorHandler("Note not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Note deleted",
    note: deletedNote,
  });
});
