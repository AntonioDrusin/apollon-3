import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import {CurveDisplay} from "../../curves/Curves";
import React, {useContext} from "react";
import {getThemeByName, ThemeContext} from "../../../App";
import {useDrop} from "react-dnd";
import {CurveLabels, CurveNames, Curves } from "../../../link/Curves";


interface OutputSourceSelectProps {
    selectedInput?: string;
    selectedCurve?: string;
    label: string;

    onInputChange(key: string): void;
    onCurveChange(curve: string): void;
}

export const OutputSourceSelect = React.memo(
    ({selectedInput, label, onInputChange, selectedCurve, onCurveChange}: OutputSourceSelectProps) => {
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);
    const [, drop] = useDrop(() => ({
        accept: "card",
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            what: monitor.getItem(),
        }),
        drop: (item: any) => {
            if (item) {
                onInputChange(item.key);
            }
        },
    }), [onInputChange])

    const MANUAL = "Manual";
    const selectedInputValue = selectedInput || MANUAL;
    const handleInputChange = (event: any) => {
        onInputChange(event.target.value === MANUAL ? undefined : event.target.value);
    }

    const handleCurveChange = (event: any) => {
        onCurveChange(event.target.value);
    }

    return (<>
        <Box sx={{display: "flex", p: 1, m: 0, width: "100%"}} ref={drop}>
            <Box
                sx={{
                    width: 54, height: 54, mr: 1, p: 1,
                    borderRadius: 27,
                    backgroundColor: DataSourceInfos[selectedInputValue as KeysOfNeurosityData]?.color ?? theme.palette.background.default
                }}>
                <Box sx={{margin: "auto"}}><CurveDisplay curve={selectedCurve} color="white"/></Box>
            </Box>
            <Box sx={{flexGrow: 1}}>
                <FormControl fullWidth component="span" sx={{width: "100%"}}>
                    <InputLabel id={"input-curve-" + label}>Curve</InputLabel>
                    <Select value={selectedCurve}
                            labelId={"input-curve-" + label}
                            label="Curve"
                            onChange={handleCurveChange}
                    >
                        {
                            CurveNames.map((curve: Curves) =>
                            {
                                return <MenuItem key={curve + "-curve-key-" + label} value={curve}>
                                    {CurveLabels[curve]}
                                </MenuItem>;
                            })
                        }
                    </Select>
                </FormControl>
            </Box>
        </Box>
        <Box sx={{width: "100%", p: 1, m: 0}}>
            <FormControl fullWidth component="span" sx={{width: "100%"}}>
                <InputLabel id={"input-" + label}>{label}</InputLabel>
                <Select value={selectedInputValue}
                        labelId={"input-" + label}
                        label={label}
                        onChange={handleInputChange}
                >
                    <MenuItem value={"Manual"} key={"Manual-key"}>{"<Manual>"}</MenuItem>
                    {
                        Object.keys(DataSourceInfos).map((infoKey) => {
                            return <MenuItem key={infoKey + "-key"} value={infoKey}>
                                {DataSourceInfos[infoKey as KeysOfNeurosityData].name}
                            </MenuItem>;
                        })
                    }
                </Select>
            </FormControl>
        </Box>
    </>);
});
