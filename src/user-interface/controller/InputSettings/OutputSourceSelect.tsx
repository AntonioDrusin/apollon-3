import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import {CurveDisplay} from "../../curves/Curves";
import React, {useContext} from "react";
import {getThemeByName, ThemeContext} from "../../../App";
import {useDrop} from "react-dnd";



interface OutputSourceSelectProps {
    selectedInput?: string;
    label: string;
    handleChange(event: any): void;
}

export const OutputSourceSelect = React.memo(({selectedInput, label, handleChange}: OutputSourceSelectProps) => {
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
                handleChange(item.key);
            }
        },
    }))

    const MANUAL = "Manual";
    const selectedInputValue = selectedInput || MANUAL;
    const handleInputChange = (event: any) => {
        handleChange(event.target.value === MANUAL ? undefined : event.target.value);
    }

    return (
        <Box sx={{display: "flex", p: 1, m: 0, width: "100%"}} ref={drop}>
            <Box
                sx={{
                    width: 54, height: 54, mr: 1, p: 1,
                    borderRadius: 27,
                    backgroundColor: DataSourceInfos[selectedInputValue as KeysOfNeurosityData]?.color ?? theme.palette.background.default
                }}>
                <Box sx={{margin: "auto"}}><CurveDisplay curve={"linear"} color="white"/></Box>
            </Box>
            <Box sx={{flexGrow: 1}}>
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
        </Box>
    );
});
