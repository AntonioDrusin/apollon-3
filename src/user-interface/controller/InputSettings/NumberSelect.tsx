import {Box, Slider, Typography} from "@mui/material";
import React from "react";
import {OutputSourceSelect} from "./OutputSourceSelect";

export interface OutputSelectProps {
    selectedInput?: string
    label: string;
    manualValue: number;
    lowValue: number;
    highValue: number;
    rangeBackground?: string;

    onSelectionChange(selectedInput: string): void;
    onClampChange(lowClamp: number, highClamp: number): void;
    onManualValueChange(manualValue: number): void;
}

export function NumberSelect({   manualValue,
                                 lowValue,
                                 highValue,
                                 selectedInput,
                                 label,
                                 rangeBackground,
                                 onSelectionChange,
                                 onManualValueChange,
                                 onClampChange,
                             }: OutputSelectProps) {

    const handleManualSignalChange = (event: any) => {
        onManualValueChange(event.target.value)
    };

    const flip = lowValue < highValue;

    const leftSkip = flip ? `0%` : `${(highValue) * 100}%`;
    const leftWidth = flip ? `${lowValue * 100}%` : `${(lowValue - highValue) * 100}%`;
    const rightSkip = flip ? `${highValue * 100}%` : `0%`;
    const rightWidth = flip ? `${(1 - highValue) * 100}%` : `0%`;
    const gridStyle = {
        display: "grid"
    };
    const cellStyle = {
        gridColumn: 1,
        gridRow: 1
    };
    const background = rangeBackground ?? "linear-gradient(90deg, rgba(48,143,43,1) 0%, rgba(53,219,41,1) 100%)";

    return <>
        <OutputSourceSelect selectedInput={selectedInput}
                            handleChange={onSelectionChange}
                            label={label}
        />
        <Box sx={{m: 1, width: 320}}>
            <Slider size="small" value={manualValue} onChange={handleManualSignalChange} step={0.01} min={0} max={1.0}
                    disabled={!!selectedInput}></Slider>
            <Typography>Mapped Range</Typography>
            <Slider size="small" value={lowValue} onChange={(event: any) => {
                onClampChange(event.target.value, highValue);
            }} step={0.01} min={0} max={1.0}></Slider>
            <Box style={gridStyle} sx={{mt: -1}}>
                <Box style={cellStyle}
                     sx={{width: "100%", background: background, height: 2}}></Box>
                <Box style={cellStyle}
                     sx={{width: leftWidth, ml: leftSkip, background: "rgba(0,0,0,0.8)", height: 2}}></Box>
                <Box style={cellStyle}
                     sx={{width: rightWidth, ml: rightSkip, background: "rgba(0,0,0,0.8)", height: 2}}></Box>
            </Box>

            <Slider size="small" value={highValue} onChange={(event: any) => {
                onClampChange(lowValue, event.target.value);
            }} step={0.01} min={0} max={1.0}></Slider>
        </Box>
    </>
}