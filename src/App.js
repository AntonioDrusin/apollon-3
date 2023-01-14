import './App.css';
import {
    createHashRouter, generatePath, RouterProvider,
} from "react-router-dom";
import Home, {homeLoader} from "./home/Home"
import Visualizer, {visualizerLoader} from "./visualizer/Visualizer";
import Controller, {controllerLoader} from "./controller/Controller";
import {LoginPage} from "./controller/LoginPage";
import React from "react";
import {theme} from "./theme";
import {CssBaseline, ThemeProvider} from "@mui/material";

export default App;


const router = createHashRouter([
    {path: "visualizer", element: <Visualizer/>, loader: visualizerLoader},
    {
        path: "controller", element: <Controller/>, loader: controllerLoader,
        children: []
    },
    {path: "login", element: <LoginPage/>},
    {path: "/", element: <Home/>, loader: homeLoader},
]);

console.log(generatePath("visualizer"));

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <RouterProvider router={router}>
            </RouterProvider>
        </ThemeProvider>
    );
}
