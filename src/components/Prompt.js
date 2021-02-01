import React, {useState} from 'react';
import {TextField, Button, Modal, Backdrop, Fade, makeStyles} from '@material-ui/core';
import {useHistory, useLocation} from "react-router-dom";
import { useSnackbar } from 'notistack';
import { observer, inject } from 'mobx-react';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4, 4, 4),
        display: 'grid',
        gridGap: theme.spacing(2),
        borderRadius: 10
    },
    btn: {
        width: '100%',
        justifySelf: 'end',
        color: 'white',
        fontFamily: "'Acme', sans-serif",
        fontSize: '150%',
        letterSpacing: 2,
        wordSpacing: 4,
        backgroundColor: 'rgba(175,6,50,1)',
        boxShadow: '2px 1px 1px 0px rgba(175,6,50,1)',
        borderRadius: 10,
        '&:hover': {
            backgroundColor: 'rgba(175,6,50,1)',
            boxShadow: '3px 2px 2px 0px rgba(175,6,50,1)'
        }
    }
}));

function Prompt(props) {
    const classes = useStyles(),
    history = useHistory(),
    { enqueueSnackbar } = useSnackbar(),
    [password, setPassword] = useState("");
    let location = useLocation();

    const back = () => {
        history.push("/");
    }

    const checkPassword = () => {
        const roomID = location.pathname.split('/')[2];
        const room = props.UserStore.rooms.find(r => r._id === roomID);
        if(password === room.roomPassword) {
            props.UserStore.setRoom(room);
            props.setOpen(true);
        }
        else {
            enqueueSnackbar("The password is incorrect!", { variant: 'error' });
        }
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal} open={true} closeAfterTransition
            BackdropComponent={Backdrop} BackdropProps={{timeout: 500}}
            onClose={back}
        >
            <Fade in={true}>
                <div className={classes.paper}>
                    <TextField
                        label="Room Password"
                        value={password}
                        variant="outlined"
                        id="password"
                        type="password"
                        onChange = {({target}) => setPassword(target.value)}
                    />
                    <Button className={classes.btn} onClick={checkPassword} >
                        OK
                    </Button>
                    <Button className={classes.btn} onClick={back} >
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
    )
}

export default inject("UserStore")(observer(Prompt));