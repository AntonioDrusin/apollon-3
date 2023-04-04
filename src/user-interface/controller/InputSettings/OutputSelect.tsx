import {Box, FormControl, InputLabel, MenuItem, Select, Slider} from "@mui/material";
import React, {useContext, useState} from "react";
import {DataSourceInfos, KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import {useDrop} from "react-dnd";
import {CurveDisplay} from "../../curves/Curves";
import {getThemeByName, ThemeContext} from "../../../App";

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
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);

    const MANUAL = "Manual";
    const [, drop] = useDrop(() => ({
        accept: "card",
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            what: monitor.getItem(),
        }),
        drop: (item: any) => {
            if (item) {
                onSelectionChange(item.key);
            }
        },
    }))

    const handleChange = (event: any) => {
        onSelectionChange(event.target.value);
    };

    const handleManualSignalChange = (event: any) => {
        onManualValueChange(event.target.value)
    };

    return <>
        <Box sx={{display: "flex", p: 0, m: 0}} ref={drop}>
            <Box
                sx={{
                    width: 54, height: 54, mx: 1, p: 1,
                    borderRadius: 27,
                    backgroundColor: DataSourceInfos[selectedInput as KeysOfNeurosityData]?.color ?? theme.palette.background.default
                }}>
                <Box sx={{margin: "auto"}}><CurveDisplay curve={"linear"} color="white"/></Box>
            </Box>
            <Box sx={{minWidth: 220}}>
                <FormControl fullWidth component="span">
                    <InputLabel id={"input-" + id}
                    >{label}</InputLabel>
                    <Select value={selectedInput}
                            labelId={"input-" + id}
                            label={label}
                            onChange={handleChange}
                    >
                        <MenuItem value={MANUAL} key={MANUAL + "-key"}>{"<Manual>"}</MenuItem>
                        {
                            Object.keys(DataSourceInfos).map((infoKey) => {
                                return <MenuItem key={infoKey + "-key"}
                                                 value={infoKey}>
                                    {DataSourceInfos[infoKey as KeysOfNeurosityData].name}
                                </MenuItem>;
                            })
                        }
                    </Select>
                </FormControl>
            </Box>
        </Box>
        <Box sx={{m: 1, p: 1, width: 320}}>
            <Slider value={manualValue} onChange={handleManualSignalChange} step={0.01} min={0} max={1.0}
                    disabled={selectedInput !== MANUAL}></Slider>
        </Box>
    </>
}