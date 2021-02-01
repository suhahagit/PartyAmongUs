import React from 'react';
import { Button, Modal, Backdrop, Fade, makeStyles } from '@material-ui/core';
import { useHistory } from "react-router-dom";

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
            boxShadow: '3px 2px 2px 0px rgba(175,6,50,1)',
        }
    }
}));

function Alert(props) {
    const classes = useStyles(),
        history = useHistory();

    const back = () => {
        history.push("/");
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal} open={true} closeAfterTransition
            BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}
            onClose={back}
        >
            <Fade in={true}>
                <div className={classes.paper} >
                    <h2>{props.text}</h2>
                    <Button className={classes.btn} onClick={back} >
                        OK
                    </Button>
                </div>
            </Fade>
        </Modal>
    )
}

export default Alert;