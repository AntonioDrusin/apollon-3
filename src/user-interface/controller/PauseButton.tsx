import {PauseCircle, PlayCircle} from "@mui/icons-material";
import {Button} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {Register} from "../../Register";

export default function PauseButton() {
    const [paused, setPaused] = useState<boolean>(false);
    const screenLink  = useMemo(() => Register.screenLink, []);

    useEffect(() => {
        const sub = screenLink.paused$().subscribe(paused => {
            setPaused(paused);
        });
        return () => {
            sub.unsubscribe();
        }
    }, [screenLink]);

    useEffect(() => {
        console.log(paused);
        if (paused) {
            screenLink.pause();
        } else {
            screenLink.play();
        }
    }, [screenLink, paused]);


    return <Button onClick={() => setPaused(!paused)} variant="outlined">
        { paused ?
            <PlayCircle color="inherit"></PlayCircle> :
            <PauseCircle color="inherit"></PauseCircle>
        }
    </Button>
}