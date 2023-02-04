import {createTheme, Theme} from "@mui/material";

// See here to create themes https://mui.com/material-ui/customization/palette/
// https://mui.com/material-ui/customization/color/#playground

export const AllThemes: { [key in string]: { name: string, theme: Theme } } = {
    "dark": {
        name: "Dark",
        theme: createTheme({
            palette: {
                mode: "dark",
            }
        })
    },
    "green": {
        name: "Green Fields",
        theme: createTheme({
            palette: {
                primary: {
                    main: '#26a69a',
                },
                secondary: {
                    main: '#5e35b1',
                },
                mode: "dark",
            }
        }),
    },
    "fire": {
        name: "Fire",
        theme: createTheme({
            palette: {
                primary: {
                    main: '#ef5350',
                },
                secondary: {
                    main: '#c0ca33',
                },
                mode: "dark"
            }
        }),
    },

};
