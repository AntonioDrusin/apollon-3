import {Box, Slider} from "@mui/material";
import React from "react";
import {OutputSourceSelect} from "./OutputSourceSelect";

export interface OutputSelectProps {
    id: string;
    selectedInput?: string
    label: string;
    manualValue: number;
    onSelectionChange(selectedInput: string): void;
    onManualValueChange(manualValue: number): void;
}

export function OutputSelect({
                                 manualValue,
                                 id,
                                 selectedInput,
                                 label,
                                 onSelectionChange,
                                 onManualValueChange
                             }: OutputSelectProps) {



    const handleManualSignalChange = (event: any) => {
        onManualValueChange(event.target.value)
    };


    return <>
        <OutputSourceSelect selectedInput={selectedInput}
                            handleChange={onSelectionChange}
                            label={label}
        />
        <Box sx={{m: 1, p: 1, width: 320}}>
            <Slider value={manualValue} onChange={handleManualSignalChange} step={0.01} min={0} max={1.0}
                    disabled={!!selectedInput}></Slider>
        </Box>
    </>
}