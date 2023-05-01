import React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {colorModes, ColorModes} from "../../../link/ColorTransmission";


interface ColorModeSelectProps {
    onChange(value: ColorModes): void;
    id: string;
    value?: string;
}

export function ColorModeSelect({id, onChange, value} : ColorModeSelectProps) {
    const handleChange = (event: any) => {
        onChange(event.target.value)
    };

    return <>
        <FormControl fullWidth component="span" >
            <InputLabel id={`${id}-input}`}>Color Mode</InputLabel>
            <Select value={value}
                    label={"Color Mode"}
                    labelId={`${id}-input}`}
                    onChange={handleChange}
            >
                {
                    Object.keys(colorModes).map((infoKey) => {
                        return <MenuItem key={`${id}-${infoKey}-item`}
                                         value={infoKey}>
                            {colorModes[infoKey as ColorModes].name}
                        </MenuItem>;
                    })
                }
            </Select>
        </FormControl>
    </>

}