import React, { useState } from 'react';
import { TextField, Button, Modal, Backdrop, Fade, makeStyles} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import AvatarOption from './AvatarOption'
import { observer, inject } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import SendIcon from '@material-ui/icons/Send';
import NoMeetingRoom from '@material-ui/icons/NoMeetingRoom';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(1, 4, 4),
        display: 'grid',
        gridGap: theme.spacing(2),
        borderRadius: 10
    },
    grid: {
        textAlign: 'center'
    }
}));

function UserForm(props) {
    const classes = useStyles(),
    [userName, setUserName] = useState(""),
    [avatar, setAvatar] = useState(""),
    { enqueueSnackbar } = useSnackbar();

    const openRoom = async () => {
        if (!userName || !avatar) {
            enqueueSnackbar('Missing Fields', { variant: 'error' });
        }
        else {
            await props.UserStore.addUser(userName, avatar);
            props.open(false);
        }
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal} open={true} closeAfterTransition
                BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}
            >
                <Fade in={true}>
                    <div className={classes.paper} >
                        <TextField
                            label="Nickname & Avatar"
                            placeholder="Nickname"
                            color="secondary"
                            value={userName}
                            variant="standard"
                            id="userName"
                            onChange={({ target }) => setUserName(target.value)}
                        />
                        <br />
                        <div id="avatarsImg" >
                            {props.UserStore.avatars.map(a => <AvatarOption key={a.name} avatar={a} setAvatar={setAvatar} />)}
                        </div>
                        <br />
                        <Grid container className={classes.grid}>
                            <Grid item xs>
                                <Link to="/">
                                    <Button variant="contained" color="secondary" endIcon={<NoMeetingRoom />}>Cancel</Button>
                                </Link>
                            </Grid>
                            <Grid item xs>
                                <Button variant="contained" color="secondary" onClick={openRoom} endIcon={<SendIcon />}>Enter</Button>
                            </Grid>
                        </Grid>
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}

export default inject("UserStore")(observer(UserForm));