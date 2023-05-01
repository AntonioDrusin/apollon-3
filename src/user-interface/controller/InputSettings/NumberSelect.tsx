import {Box, Slider, Typography} from "@mui/material";
import React  from "react";
import {OutputSourceSelect} from "./OutputSourceSelect";

export interface OutputSelectProps {
    id: string;
    selectedInput?: string
    label: string;
    manualValue: number;
    lowValue: number;
    highValue: number;

    onSelectionChange(selectedInput: string): void;

    onClampChange(lowClamp: number, highClamp: number): void;

    onManualValueChange(manualValue: number): void;
}

export function NumberSelect({
                                 manualValue,
                                 lowValue,
                                 highValue,
                                 selectedInput,
                                 label,
                                 onSelectionChange,
                                 onManualValueChange,
                                 onClampChange,
                             }: OutputSelectProps) {


    const handleManualSignalChange = (event: any) => {
        onManualValueChange(event.target.value)
    };

    const flip = lowValue > highValue;

    const leftSkip = flip ? `0%` : `${(lowValue) * 100}%`;
    const leftWidth = flip ? `${highValue * 100}%` : `${(highValue - lowValue) * 100}%`;
    const rightSkip = flip ? `${lowValue * 100}%` : `0%`;
    const rightWidth = flip ? `${(1 - lowValue) * 100}%` : `0%`;
    const gridStyle = {
        display: "grid"
    };
    const cellStyle = {
        gridColumn: 1,
        gridRow: 1
    };

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
                     sx={{width: leftWidth, ml: leftSkip, background: "red", height: 2}}></Box>
                <Box style={cellStyle}
                     sx={{width: rightWidth, ml: rightSkip, background: "red", height: 2}}></Box>
            </Box>

            <Slider size="small" value={highValue} onChange={(event: any) => {
                onClampChange(lowValue, event.target.value);
            }} step={0.01} min={0} max={1.0}></Slider>
        </Box>
    </>
}