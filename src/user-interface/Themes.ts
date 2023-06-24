import {createTheme, Theme} from "@mui/material";

// See here to create themes https://mui.com/material-ui/customization/palette/
// https://mui.com/material-ui/customization/color/#playground

declare module '@mui/material/styles' {
    interface Theme {
        apollon: {
            colorCardText: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        apollon?: {
            colorCardText?: string;
        };
    }
}

export const AllThemes: { [key in string]: { name: string, theme: Theme } } = {
    "dark": {
        name: "theme.dark",
        theme: createTheme({
            apollon: {
                colorCardText: "#050607"
            },
            palette: {
                mode: "dark",
            }
        })
    },
    "green": {
        name: "theme.greenFields",
        theme: createTheme({
            apollon: {
                colorCardText: "#050607"
            },
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
        name: "theme.fire",
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
