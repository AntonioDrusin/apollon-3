import React from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Slider, TextField
} from "@mui/material";
import {PlayArrow, Pause, Eject} from "@mui/icons-material";

export interface FilePlaybackStatusProps {
    hidden: boolean;
};

export default function FilePlaybackStatus({hidden}: FilePlaybackStatusProps) {
    const tags = [
        {ts: 1, label:"Inizio performance"},
        {ts: 1, label:"Sonata al Chiaro Di Luna"},
        {ts: 1, label:"Parte II"},
        {ts: 1, label:"Parte III"}
    ];

    return <Box hidden={hidden}>
        <Container maxWidth="xl">
            <Card sx={{p: 1, m: 1}}>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <Box sx={{flexShrink: 1, mx: 2}}>
                        <IconButton> <PlayArrow/> </IconButton>
                        <IconButton> <Eject/> </IconButton>
                        <IconButton> <Pause/> </IconButton>
                    </Box>
                    <Box sx={{mx: 2}}>
                        <Autocomplete
                            disablePortal
                            disableCloseOnSelect
                            id="combo-box-demo"
                            options={tags}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Go To..." />}
                        />
                    </Box>
                    <Box sx={{flexGrow: 1, mx: 2}}>
                        <Slider sx={{py: 0}} size="small"/>
                    </Box>
                </Box>

            </Card>
        </Container>
    </Box>
}