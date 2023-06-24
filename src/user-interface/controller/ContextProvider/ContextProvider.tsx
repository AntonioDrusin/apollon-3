import React, {useState} from "react";
import {RecordingBarContext, SnackBarContext, SnackMessage} from "./Context";

interface ContextProviderProps {
    children?: React.ReactNode;
}

export default function ContextProvider({children}: ContextProviderProps) {
    const [recordingBar, setRecordingBar] = useState(false);
    const [snackMessage, setSnackMessage] = useState<SnackMessage>();

    return <SnackBarContext.Provider value={{snackMessage, setSnackMessage}}>
        <RecordingBarContext.Provider value={{recordingBar, setRecordingBar}}>
            {children}
        </RecordingBarContext.Provider>
    </SnackBarContext.Provider>

}