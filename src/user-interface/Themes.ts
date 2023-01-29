import {createTheme, Theme} from "@mui/material";

// See here to create themes https://mui.com/material-ui/customization/palette/
// https://mui.com/material-ui/customization/color/#playground

export const AllThemes: { [key in string]: { name: string, theme: Theme } } = {
    "alex": {
        name: "Alessandro Theme 1",
        theme: createTheme({
            palette: {
                mode: "light",

            }
        }),
    },
    "dark": {
        name: "Dark",
        theme: createTheme({
            palette: {
                mode: "dark",
            }
        })
    }
};
