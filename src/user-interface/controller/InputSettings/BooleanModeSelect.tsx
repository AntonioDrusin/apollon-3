import React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {BooleanModulations} from "../../../link/ScreenLink";
import {booleanModulationModes} from "../../../link/BooleanTransmission";

interface BooleanModeSelectProps {
    onChange(value: BooleanModulations): void;
    id: string;
    value?: string;
}

export function BooleanModeSelect({id, onChange, value}: BooleanModeSelectProps) {
    const handleChange = (event: any) => {
        onChange(event.target.value)
    };

    return <FormControl fullWidth component="span">
        <InputLabel id={`${id}-input}`}>Modulation</InputLabel>
        <Select value={value}
                label={"Modulation"}
                labelId={`${id}-input}`}
                onChange={handleChange}
        >
            {
                Object.keys(booleanModulationModes).map((infoKey) => {
                    return <MenuItem key={`${id}-${infoKey}-item`}
                                     value={infoKey}>
                        {booleanModulationModes[infoKey as BooleanModulations].name}
                    </MenuItem>;
                })
            }
        </Select>
    </FormControl>

}