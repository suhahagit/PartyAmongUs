import React, { useRef, useEffect, useState } from 'react';
import BoardCanvas from './Board/BoardCanvas';
import { Button } from '@material-ui/core';
import Select from 'react-select';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import InputEmoji from "react-input-emoji";
import { observer, inject } from 'mobx-react';
import Alert from './Alert';
import { ADD_PLAYER, MOVE_PLAYER, PLAYER_MOVED, SEND_MESSAGE, RECEIVED_MESSAGE, REMOVE_PLAYER, NEW_PLAYER_HOST, CHANGE_THEME } from '../Constants';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
    selectTheme: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    },
    btn: {
        margin: theme.spacing(1),
        width: 150,
        color: 'white',
        fontFamily: "'Acme', sans-serif",
        fontSize: '100%',
        letterSpacing: 2,
        wordSpacing: 4,
        backgroundColor: 'rgba(175,6,50,0.8)',
        boxShadow: '2px 1px 1px 0px rgba(175,6,50,0.85)',
        borderRadius: 10,
        justifySelf: 'stretch',
        '&:hover': {
            backgroundColor: 'rgba(175,6,50,1)',
            boxShadow: '3px 2px 2px 0px rgba(175,6,50,0.85)'
        }
    }
}));

const Board = observer((props) => {
    const SOUNDS = {
        "disconnect": new Audio('./sounds/disconnect.wav'),
        "vote": new Audio('./sounds/vote.wav')
    },
    canvasRef = useRef(null),
    messageRef = useRef(null),
    boardRef = useRef(null),
    [theme, setTheme] = useState(props.UserStore.room.theme),
    classes = useStyles(),
    webSocket = useRef(props.UserStore.socket),
    themeOptions = props.UserStore.themes.map(t => ({ label: t.name, value: t.value })),
    [alert, setAlert] = useState({value: false, text: ""}),
    CONNECTION_ERROR = "Connection Error!",
    { enqueueSnackbar } = useSnackbar();
    let { room } = props.UserStore;
    let history = useHistory();

    const playerIndex = (socket_id) => {
        const index = boardRef.current.PLAYERS.findIndex(p => p.playerId === socket_id);
        return index;
    }

    const doDance = () => {
        if (playerIndex(webSocket.current.id) !== -1) {
            boardRef.current.PLAYERS[playerIndex(webSocket.current.id)].sendMessage('/dance');
            webSocket.current.emit(SEND_MESSAGE, {
                id: webSocket.current.id,
                message: '/dance',
                room: room._id
            });
        }
        else
            setAlert({value: true, text: CONNECTION_ERROR});
    }

    const onSelectTheme = (e) => {
        const theTheme = e.value;
        boardRef.current.changeTheme(theTheme);
        setTheme(theTheme);
        props.UserStore.changeTheme(room._id, theTheme);
    }

    const sendMessage = () => {
        const message = messageRef.current;
        if (playerIndex(webSocket.current.id) !== -1) {
            boardRef.current.PLAYERS[playerIndex(webSocket.current.id)].sendMessage(message.value);
            webSocket.current.emit(SEND_MESSAGE, {
                id: webSocket.current.id,
                message: message.value,
                room: room._id
            });
        }
        else
            setAlert({value: true, text: CONNECTION_ERROR});
    }

    const onCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let x = Math.floor(e.clientX - rect.left);
        let y = Math.floor(e.clientY - rect.top);
        const playerId = webSocket.current.id;

        if (playerIndex(playerId) !== -1) {
            if (x + boardRef.current.PLAYERS[playerIndex(playerId)].width > canvasRef.current.width)
                x = x - boardRef.current.PLAYERS[playerIndex(playerId)].width;

            if (y + boardRef.current.PLAYERS[playerIndex(playerId)].height > canvasRef.current.height)
                y = y - boardRef.current.PLAYERS[playerIndex(playerId)].height;

            webSocket.current.emit(MOVE_PLAYER, {
                id: webSocket.current.id,
                x: x,
                y: y,
                room: room._id
            });
            boardRef.current.PLAYERS[playerIndex(playerId)].targetPos = { x, y };
        }
        else
            setAlert({value: true, text: CONNECTION_ERROR});
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        boardRef.current = new BoardCanvas(canvas, context, theme);
        boardRef.current.start();

        if (webSocket.current.id === room.host) {
            room.guests.forEach(g => boardRef.current.newPlayer({
                playerId: g.id,
                userName: g.userName,
                avatar: g.avatar,
                x: props.UserStore.player_x,
                y: props.UserStore.player_y,
                theme: room.theme
            }));
        }
        else {
            webSocket.current.on(NEW_PLAYER_HOST, (data) => {
                data.forEach(d => boardRef.current.newPlayer({
                    playerId: d.playerId,
                    userName: d.userName,
                    avatar: d.avatar,
                    theme: d.theme,
                    x: d.x,
                    y: d.y,
                }, { x: d.x, y: d.y }));
            })
        }

        webSocket.current.on(ADD_PLAYER, (data) => {
            enqueueSnackbar(`${data.userName} has joined the room.`, { variant: 'success' });
            boardRef.current.newPlayer({
                playerId: data.playerId,
                userName: data.userName,
                avatar: data.avatar,
                x: data.x,
                y: data.y,
                theme: data.theme
            });
            if (webSocket.current.id === room.host)
                webSocket.current.emit(NEW_PLAYER_HOST, {players: boardRef.current.PLAYERS, socket: data.playerId});
        });

        webSocket.current.on(PLAYER_MOVED, (data) => {
            const { id, x, y } = data;
            boardRef.current.PLAYERS[playerIndex(id)].targetPos = { x, y };
        });

        webSocket.current.on(RECEIVED_MESSAGE, (data) => {
            const { message, id } = data;
            boardRef.current.PLAYERS[playerIndex(id)].sendMessage(message);
        });

        webSocket.current.on(CHANGE_THEME, (data) => {
            if (data.theme) {
                boardRef.current.changeTheme(data.theme);
                setTheme(data.theme);
            }
        });

        webSocket.current.on(REMOVE_PLAYER, (data) => {
            const index = playerIndex(data);
            const userName = boardRef.current.PLAYERS[index].userName;
            SOUNDS.disconnect.play();
            boardRef.current.PLAYERS.splice(index, 1);
            enqueueSnackbar(`${userName} has Left the room.`, { variant: 'warning' });
        });
    }, []);

    const deleteRoom = async () => {
        props.UserStore.deleteRoom();
        history.push("/");
    }

    return (
        <div id="board">
            <canvas onMouseDown={onCanvasClick} ref={canvasRef} width="1000" height="632"></canvas>
            <br />
            <div id="underboard">
                <div>
                    <InputEmoji maxLength={31} ref={messageRef} onEnter={sendMessage} cleanOnEnter placeholder="Type a message (/dance to dance)" />
                </div>
                <Button type="button" onClick={doDance} className={classes.btn}>Dance</Button>
            </div>
            {
                webSocket.current.id === room.host &&
                <div id="host_power">
                    <Select className={classes.selectTheme} options={themeOptions} placeholder="Select a theme" onChange={onSelectTheme} name="select_theme" color="secondary" />
                    <Button className={classes.btn} onClick={deleteRoom} >
                            Delete Room
                    </Button>
                </div>
            }
            { alert.value && <Alert text={alert.text} />}
        </div>
    )
})

export default inject("UserStore")(Board);