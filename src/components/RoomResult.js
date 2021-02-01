import React from 'react';
import { useHistory } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import LockTwoToneIcon from '@material-ui/icons/LockTwoTone';
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    chip: {
        margin: theme.spacing(0.5),
        backgroundColor: '#b3b0a9'
    }
}));

function RoomResult(props) {
    const { roomPassword, roomName, theme, guests, size, description, tags } = props.room,
    classes = useStyles();
    let history = useHistory();

    const openRoom = () => {
        props.UserStore.getRoom(props.id);
        history.push(`/room/${props.id}`);
    }

    return (
        <div className="roomResult" onClick={openRoom}>
            <img src={`./img/theme${theme}.jpg`} alt="Theme" />
            <h3>{roomName}</h3>
            {tags.map((t, i) => <Chip label={t} key={i} className={classes.chip} />)}
            <p>{description}</p>
            <p>{guests.length}/{size}</p>
            {roomPassword && <LockTwoToneIcon />}
        </div>
    )
}

export default inject("UserStore")(observer(RoomResult));