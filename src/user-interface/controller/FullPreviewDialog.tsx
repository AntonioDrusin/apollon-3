import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';

interface FullPreviewDialogProps {
    open: boolean;
    onClose: () => void;
}

// makeStyles ??

export default function FullScreenDialog({ open, onClose }: FullPreviewDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} sx={{ minWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column' }}>

            <DialogTitle>Dialog Title</DialogTitle>
            <DialogContent>
                This is the preview;

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
