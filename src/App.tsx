import './App.css';
import {
    createHashRouter, generatePath, RouterProvider,
} from "react-router-dom";
import Visualizer, {visualizerLoader} from "./user-interface/visualizer/Visualizer";
import Controller, {controllerLoader} from "./user-interface//controller/Controller";
import React from "react";
import {theme} from "./theme";
import {CssBaseline, ThemeProvider} from "@mui/material";

export default App;


const router = createHashRouter([
    {path: "visualizer", element: <Visualizer/>, loader: visualizerLoader},
    {path: "/", element: <Controller/>, loader: controllerLoader},
]);


function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <RouterProvider router={router}/>
        </ThemeProvider>
    );
}
