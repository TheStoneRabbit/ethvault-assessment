const notes = [];
let nextId = Date.now();

function listNotes() {
  return notes;
}

function createNote(payload) {
  const note = { id: String(nextId++), ...payload };
  notes.push(note);
  return note;
}

function findNote(id) {
  return notes.find((note) => note.id === id);
}

function updateNote(id, updates) {
  const note = findNote(id);
  if (note) {
    Object.assign(note, updates);
  }
  return note;
}

function deleteNote(id) {
  const index = notes.findIndex((note) => note.id === id);
  if (index !== -1) {
    return notes.splice(index, 1)[0];
  }
}

module.exports = {
  listNotes,
  createNote,
  findNote,
  updateNote,
  deleteNote,
};
