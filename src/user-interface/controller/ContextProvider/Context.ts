import React from "react";

interface RecordingBarContextValue {
    recordingBar: boolean;
    setRecordingBar: React.Dispatch<React.SetStateAction<boolean>>,
}

export interface SnackMessage {
    text: string,
    data?: object,
}

interface SnackBarContextValue {
    snackMessage: SnackMessage | undefined,
    setSnackMessage: React.Dispatch<React.SetStateAction<SnackMessage | undefined>>,
}

export const RecordingBarContext =  React.createContext({} as RecordingBarContextValue);
export const SnackBarContext =  React.createContext({} as SnackBarContextValue);
