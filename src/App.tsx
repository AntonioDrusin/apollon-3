import "./App.css";
import {
    createHashRouter, RouterProvider,
} from "react-router-dom";
import VisualizerArea, {visualizerLoader} from "./user-interface/visualizer/VisualizerArea";
import Controller, {controllerLoader} from "./user-interface//controller/Controller";
import React, {useState} from "react";
import {CssBaseline, Theme, ThemeProvider} from "@mui/material";
import {AllThemes} from "./user-interface/Themes";

export default App;


const router = createHashRouter([
    {path: "visualizer", element: <VisualizerArea/>, loader: visualizerLoader},
    {path: "/", element: <Controller/>, loader: controllerLoader},
]);


export const getThemeByName = (name: string): Theme => {
    return AllThemes[name].theme;
};


interface ThemeContextValue {
    themeName: string,
    setThemeName: React.Dispatch<React.SetStateAction<string>>
}

export const ThemeContext =  React.createContext({} as ThemeContextValue);

function App() {
    const [themeName, setThemeName] = useState("dark");
    const theme = getThemeByName(themeName);

    return (
        <ThemeContext.Provider value={{themeName, setThemeName}}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <RouterProvider router={router}/>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}
