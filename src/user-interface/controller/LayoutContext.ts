import React from "react";

interface LayoutContextValue {
    recordingBar: boolean;
    setRecordingBar: React.Dispatch<React.SetStateAction<boolean>>,
    setSnackMessage: React.Dispatch<React.SetStateAction<string | undefined>>,
}

export const LayoutContext =  React.createContext({} as LayoutContextValue);
