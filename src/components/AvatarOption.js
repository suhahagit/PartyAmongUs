import React from 'react';
import {Avatar} from '@material-ui/core';
import { observer, inject } from 'mobx-react';

function AvatarOption(props) {
    const {avatar, setAvatar, create} = props;

    const isAvatarInRoom = () => {
        return create ? false : props.UserStore.room.guests.find(g => g.avatar === avatar.name);
    }

    const radioChange = () => {
        const radio = document.getElementById(avatar.name);
        if(radio.disabled) {
            setAvatar("");
        }
        else {
            setAvatar(avatar.name);
            radio.checked = true;
        }
    }

    return (
        <>
            {isAvatarInRoom() ?
                <input type="radio" name="avatar"
                id={avatar.name} className="input-hidden" disabled /> :
                <input type="radio" name="avatar"
                id={avatar.name} className="input-hidden" />}
            <label onClick={radioChange}>
            <Avatar variant="rounded" style={{height: 55, margin: 4}} alt="avatar" src={avatar.src} />
            </label>
        </>
    )
}

export default inject("UserStore")(observer(AvatarOption));