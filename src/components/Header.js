import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { useHistory , useLocation } from "react-router-dom";
import {Button} from '@material-ui/core';
import CreateRoom from './CreateRoom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    btn: {
        width: '40%',
        justifySelf: 'end',
        color: 'white',
        fontFamily: "'Acme', sans-serif",
        fontSize: '150%',
        letterSpacing: 2,
        wordSpacing: 4,
        backgroundColor: 'rgba(175,6,50,0.8)',
        boxShadow: '2px 1px 1px 0px rgba(175,6,50,0.85)',
        borderRadius: 10,
        '&:hover': {
            backgroundColor: 'rgba(175,6,50,1)',
            boxShadow: '3px 2px 2px 0px rgba(175,6,50,0.85)',
        }
    },
    logo: {
        height: '150%'
    }
}));

function Header(props) {
    const history = useHistory(),
    location = useLocation(),
    classes = useStyles(),
    [popUp, setPopUp] = useState(false);

    const leave = async () => {
        const room = location.pathname.split('/')[1];

        if(room === 'room'){
            props.UserStore.LeaveRoom();
            history.push("/");
        }
    }

    const popForm = () => {
        const currPop = popUp ? false : true;
        setPopUp(currPop);
    }

    useEffect(() => { document.body.style = location.pathname.includes('/room/') ? "background: url('./img/BackBoard.jpg')" : "background: url('./img/BackMain.gif')" }, [location]);

    return (
        <div id="header">
            <img src="./img/logo.png" alt="Logo" className={classes.logo} />
            {location.pathname.includes('/room/') ?
                <Button color="primary" className={classes.btn} onClick={leave}>
                    Leave Room
                </Button>
                :
                <Button color="primary" className={classes.btn} id="createRoom" onClick={popForm}>
                    Create Room
                </Button>
            }
            {popUp && <CreateRoom open={setPopUp} />}
		</div>
    )
}

export default inject("UserStore")(observer(Header));