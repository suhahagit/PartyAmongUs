import React, {useState} from 'react';
import { observer, inject } from 'mobx-react';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { red } from '@material-ui/core/colors';

function Song(props) {
    const {id, votes, song} = props.song,
    [like, setLike] = useState(false);

    const likeSong = async () => {
        await props.UserStore.addLike(id, like ? true : false);
        setLike(like => !like);
    }

    return (
        <div className="song_vote_icon">
            <p className="song_playlist">{song}</p><p className="votes">{votes}</p>
            {(like ? <FavoriteIcon color="action" fontSize="large" style={{ color: red[500], marginTop: 18 }} onClick={likeSong} />
                : <FavoriteBorderIcon color="action" fontSize="large" style={{ color: red[500], marginTop: 18 }} onClick={likeSong} />)}
        </div>
    )
}

export default inject("UserStore")(observer(Song));
