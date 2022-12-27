import "./Controller.css"

import {Slider, Stack} from "@mui/material";
import {CameraRear} from "@mui/icons-material";
import {useState, useEffect} from "react";
export function controllerLoader() {
    return null;
}

export default function Controller() {
    const [width, setWidth] = useState(0)

    const widthChange = (event: Event, newValue: number | number[]) => {
        setWidth(newValue);
    };

    useEffect(() => {
        const value = {
            width: width,
        };
        localStorage.setItem('controls', JSON.stringify(value));
    });

    return (
        <div className="Controller">
            <h1>Controller</h1>
            <div className="Controls">
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center" >
                    <CameraRear />
                    <Slider aria-label="Volume" value={width} onChange={widthChange} />
                </Stack>
            </div>
        </div>
    );
}