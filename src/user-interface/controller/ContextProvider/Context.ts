import React from "react";

interface RecordingBarContextValue {
    recordingBar: boolean;
    setRecordingBar: React.Dispatch<React.SetStateAction<boolean>>,
}

interface SnackBarContextValue {
    snackMessage: string | undefined,
    setSnackMessage: React.Dispatch<React.SetStateAction<string | undefined>>,
}

export const RecordingBarContext =  React.createContext({} as RecordingBarContextValue);
export const SnackBarContext =  React.createContext({} as SnackBarContextValue);
