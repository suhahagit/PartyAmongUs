import React from 'react';
import { observer, inject } from 'mobx-react';
import Song from './Song';

function Playlist(props) {
    return (
        <div id="songs_list">
            {props.UserStore.sortQueue.map((q, i) => <Song song={q} key={q._id}/>)}
        </div>
    )
}

export default inject("UserStore")(observer(Playlist));