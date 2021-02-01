const express = require('express');
const router = express.Router();
const Room = require('../models/Room.js');
const ObjectId = require('mongodb').ObjectId;

router.get('/rooms', async function (req, res) {
    try {
        const rooms = await Room.find({});
        res.send(rooms);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.get('/room/:roomID', async function (req, res) {
    try {
        const id = ObjectId(req.params.roomID);
        const room = await Room.findById(id);
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.post('/room', async function (req, res) {
    try {
        const room = new Room({ ...req.body });
        await room.save();
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.delete('/room/:roomID', async function (req, res) {
    try {
        const room = await Room.findByIdAndRemove({ _id: req.params.roomID });
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.put('/room/:roomID', async function (req, res) {
    try {
        const { newVal, field } = req.body;
        const room = await Room.findOneAndUpdate({ _id: req.params.roomID }, { [field]: newVal }, { new: true });
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.put('/add/:roomID/:field', async function (req, res) {
    const newObj = req.body;
    const { roomID, field } = req.params;
    try {
        const room = await Room.findOneAndUpdate({ _id: roomID }, { '$push': { [field]: newObj } }, { new: true });
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});


router.delete('/delete/:roomID/:objectID/:field', async function (req, res) {
    const { roomID, objectID, field } = req.params;
    try {
        const room = await Room.findOneAndUpdate({ _id: roomID }, { "$pull": { [field]: { "id": objectID } } }, { new: true });
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.put('/vote/:roomID/:songID/:value', async (req, res) => {
    let { roomID, songID, value } = req.params;
    value = parseInt(value);

    try {
        const room = await Room.findOneAndUpdate({ "_id": roomID, "queue.id": songID }, { $inc: { "queue.$.votes": value } }, { new: true });
        res.send(room);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
});

module.exports = router;