import React from 'react';
import YouTube from 'react-youtube';
import { SYNC_TIME, HOST_SYNC_TIME } from '../Constants';
import { observer, inject } from 'mobx-react';

const Video = observer((props) => {

	const opts = {
		height: '220',
		width: '380',
		playerVars: {
			controls: 0,
			autoplay: 1,
			start: props.start ? Math.ceil(props.start) + 5 : 0
		}
	}

	const onReady = (event) => {
		if (!props.UserStore.vidPlayer)
			props.UserStore.setVidPlayer(event.target);

		if (props.UserStore.socket.id === props.UserStore.room.host) {
			props.UserStore.socket.emit(SYNC_TIME, {
				currentTime: props.UserStore.vidPlayer.getCurrentTime(),
				room: props.UserStore.room._id
			});
		}
	}

	const onStateChanged = (event) => {
		if (!props.UserStore.vidPlayer)
			props.UserStore.setVidPlayer(event.target);

		if (event.data === 5 && props.start)
			props.UserStore.socket.emit(HOST_SYNC_TIME, props.UserStore.room.host);
	}

	const End = () => {
		if (props.UserStore.socket.id === props.UserStore.room.host)
			props.UserStore.setCurrVid('');
	}


	return (
		<div>
			<div className="responsive-video">
				<YouTube
					videoId={props.videoId}
					opts={opts}
					onReady={onReady}
					onStateChange={onStateChanged}
					onEnd={End}
					onError={End}
				/>
			</div>
		</div>
	);
});

export default inject("UserStore")(Video);