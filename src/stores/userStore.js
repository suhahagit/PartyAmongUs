import { makeObservable, observable, action, computed} from 'mobx';
import axios from 'axios';
import io from "socket.io-client";
import { JOIN_ROOM, LEAVE_ROOM, SUGGEST_SONG, NEW_SONG, VOTE_SONG, API_PATH, SYNC_TIME, HOST_SYNC_TIME,
        SERVER_PATH, VIDEO_INFORMATION_NEW, ASK_FOR_VIDEO_INFORMATION, PLAY_SONG, DEFAULT_PLAYER_POS, CHANGE_THEME } from '../Constants';
const SERVER_URL = `${SERVER_PATH}${API_PATH}`;

export class UserStore {
    constructor() {
        this.socket = io(SERVER_PATH);
        this.getRooms();
        this.room = {};
        this.rooms = [];
        this.player_x = DEFAULT_PLAYER_POS.x;
        this.player_y = DEFAULT_PLAYER_POS.y;
        this.userName = "";
        this.avatar = "";
        this.currVidId = '';
        this.vidPlayer = null;
        this.currentVidTime = 0;
        this.nextVidId = '';
        this.avatars = [
            {name: "0" , src: "./img/avatar_red.gif"},
            {name: "1", src: "./img/avatar_yellow.gif"},
            {name: "2" , src: "./img/avatar_orange.gif"},
            {name: "3", src: "./img/avatar_white.gif"},
            {name: "4", src: "./img/avatar_lime.gif"},
            {name: "5" , src: "./img/avatar_pink.gif"},
            {name: "6", src: "./img/avatar_cyan.gif"},
            {name: "7", src: "./img/avatar_black.gif"},
            {name: "8", src: "./img/avatar_purple.gif"},
            {name: "9", src: "./img/avatar_blue.gif"}
        ];

        this.genres = ["Blues", "Classical", "Hip-Hop",
                        "Children", "Comedy", "Dance", "Electronic",
                        "Pop", "Jazz", "Anime", "K-Pop", "Opera",
                        "Rock", "Vocal", "Arabic" ];

        this.themes=[
            {name: "Snowy", value: "0"},
            {name: "Sky", value: "1"},
            {name: "Thunder", value: "2"},
            {name: "Halloween1", value: "3"},
            {name: "Halloween2", value: "4"},
            {name: "WildZone", value: "5"},
            {name: "Medieval", value: "6"},
            {name: "Disco", value: "7"},
            {name: "DiscoStar", value: "8"},
            {name: "PlantWorld", value: "9"},
            {name: "DJ.Penguin", value: "10"},
            {name: "Splash", value: "11"},
            {name: "Astro", value: "12"},
            {name: "Christmas", value: "13"}
        ];

        makeObservable(this, {
            rooms: observable,
            userName: observable,
            avatar: observable,
            room: observable,
            player_x: observable,
            player_y: observable,
            vidPlayer: observable,
            currVidId: observable,
            currentVidTime: observable,
            nextVidId: observable,
            createRoom: action,
            removeSong: action,
            getRoom: action,
            getRooms: action,
            setRoom: action,
            addUser: action,
            suggestSong: action,
            LeaveRoom: action,
            addLike: action,
            deleteRoom: action,
            listenToSocket: action,
            sortQueue: computed,
            setCurrVid: action,
            setVidPlayer: action,
            setCurrVidTime: action,
            spliceSong: action,
        });
        this.listenToSocket();
    }

    listenToSocket() {
        this.socket.on(NEW_SONG, (data) => {
            const {id, song} = data;
            this.room.queue.push({id, song, votes: 1});
            if (this.socket.id === this.room.host && !this.currVidId )
                this.setCurrVidTime(1);
        });

        this.socket.on(VOTE_SONG, (data) => {
            const {songID, value} = data;
            this.room.queue.find(q => q.id === songID).votes += value;
        });

        this.socket.on(VIDEO_INFORMATION_NEW, (data) => {
            this.setCurrVid(data.currVidId);
            this.setCurrVidTime(data.time);
            setTimeout(() => { this.socket.emit(HOST_SYNC_TIME, this.room.host) }, 6000);
        });

        this.socket.on(ASK_FOR_VIDEO_INFORMATION, (data) => {
			const objectData = {
				socket: data,
				currVidId: this.currVidId,
				time: this.vidPlayer && this.vidPlayer.getCurrentTime()
            }
			this.socket.emit(VIDEO_INFORMATION_NEW, objectData);
        });

        this.socket.on(PLAY_SONG, async (data) => {
            this.spliceSong(data.song);
            this.setCurrVid(data.song);
            this.setCurrVidTime(data.time);
        });

        this.socket.on(SYNC_TIME, (data) => {
            if (this.vidPlayer)
                this.vidPlayer.seekTo(data, true);
        });

        this.socket.on(HOST_SYNC_TIME, ()=>{
            if (this.vidPlayer) {
                this.socket.emit(SYNC_TIME, {
                    currentTime: this.vidPlayer.getCurrentTime(),
                    room: this.room._id
                });
            }
        });
    }

    async getRooms() {
        try {
            const result = (await axios.get(`${SERVER_URL}/rooms`)).data;
            this.rooms = result;
        }
        catch (error) {
            return error;
        }
    }

    async setRoom(room) {
        this.room = room;
    }

    compare(a, b) {
        if (a.guests.length > b.guests.length)
            return -1;
        else if (a.guests.length < b.guests.length)
            return 1;
        else
            return 0;
    }

    compareSongs(a, b) {
        if (a.votes > b.votes)
            return -1;
        else if (a.votes < b.votes)
            return 1;
        else
            return 0;
    }

    get sortQueue() {
        return [...this.room.queue].sort(this.compareSongs);
    }

    getTop10() {
        return [...this.rooms].sort(this.compare);
    }

    async addLike(songID, unlike) {
        try {
            const value = unlike ? -1 : 1;
            this.room = (await axios.put(`${SERVER_URL}/vote/${this.room._id}/${songID}/${value}`)).data;
            this.socket.emit(VOTE_SONG, { room: this.room._id, songID, value });
        }
        catch (error) {
            console.log(error);
        }
    }

    async createRoom(roomName, roomPassword, description, tags, theme, userName, avatar) {
        try {
            const host = this.socket.id;
            this.avatar = this.avatars.find(a => a.name === avatar);
            this.userName = userName;
            const guests = [];
            guests.push({id: this.socket.id, userName, avatar});
            const hostPassword = this.socket.id;
            const room = { roomName, guests, roomPassword, host, description, tags, queue: [], theme, hostPassword, size: 10 };
            this.room = (await axios.post(`${SERVER_URL}/room`, room)).data;
            this.socket.emit(JOIN_ROOM, { room: this.room._id });
        }
        catch (error) {
            console.log(error);
        }
    }

    async getRoom(id) {
        try {
            const result = (await axios.get(`${SERVER_URL}/room/${id}`)).data;
            this.room = result;
        }
        catch (error) {
            console.log(error);
        }
    }

    async LeaveRoom() {
        try {
            await axios.delete(`${SERVER_URL}/delete/${this.room._id}/${this.socket.id}/guests`);
            this.room = null;
            this.getRooms();
            this.socket.emit(LEAVE_ROOM);
        }
        catch (error) {
            console.log(error);
        }
    }

    async deleteRoom() {
        try {
            await axios.delete(`${SERVER_URL}/room/${this.room._id}`);
            this.room = null;
            this.getRooms();
        }
        catch (error) {
            console.log(error);
        }
    }

    async suggestSong(id, song) {
        try {
            const newVal = {id, song, votes: 1};
            this.room = (await axios.put(`${SERVER_URL}/add/${this.room._id}/queue`, newVal)).data;
            this.socket.emit(SUGGEST_SONG, {
                room: this.room._id,
                song: song,
                id: id
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    async removeSong(vidId) {
        try {
            this.room = (await axios.delete(`${SERVER_URL}/delete/${this.room._id}/${vidId}/queue`)).data;
        }
        catch (error) {
            console.log(error);
        }
    }

    async addUser(userName, avatar) {
        try {
            this.userName = userName;
            this.avatar = this.avatars.find(a => a.name === avatar);
            const body = { id: this.socket.id, userName, avatar };
            this.room = (await axios.put(`${SERVER_URL}/add/${this.room._id}/guests`, body)).data;
            this.socket.emit(JOIN_ROOM, {
                room: this.room._id,
                player: {
                    playerId: this.socket.id,
                    userName: this.userName,
                    avatar: this.avatar.name,
                    x: this.player_x,
                    y: this.player_y,
                    theme: this.room.theme
                },
                host: this.room.host
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    async changeTheme(room_id, themeNum) {
        try {
            const theme = {newVal: themeNum, field: 'theme'};
            await axios.put(`${SERVER_URL}/room/${room_id}`, theme);
            this.socket.emit(CHANGE_THEME, {
                room: room_id,
                player: {
                    theme: themeNum
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    setCurrVid(vidId) {
        this.currVidId = vidId;
    }

    setVidPlayer(vidPlayer) {
        this.vidPlayer = vidPlayer;
    }

    setCurrVidTime(time) {
        this.currentVidTime = time;
    }

    spliceSong(songID) {
        const index = this.room.queue.findIndex(q => q.id === songID);
        index >= 0 && this.room.queue.splice(index, 1);
    }
}