const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomName: String,
    guests: [{id: String, userName: String, avatar: String}],
    roomPassword: String,
    host: String,
    description: String,
    tags: [String],
    queue: [{id: String, song: String, votes:Number}],
    theme: String,
    hostPassword: String,
    size: Number
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;