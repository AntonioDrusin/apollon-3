import React, {useEffect, useMemo, useState} from "react";
import {DeviceStatus} from "@neurosity/sdk/dist/esm/types/status";
import Typography from "@mui/material/Typography";
import {Box} from "@mui/material";
import {
    Battery20, Battery30, Battery50, Battery60, Battery80, Battery90,
    BatteryAlert, BatteryCharging20, BatteryCharging30, BatteryCharging50, BatteryCharging60,
    BatteryCharging80, BatteryCharging90, BatteryChargingFull,
    BatteryFull
} from "@mui/icons-material";
import {Register} from "../../Register";

const statesLabels = {
    booting: "Starting OS...",
    shuttingOff: "Shutting off...",
    updating: "Updating OS...",
    online: "Online",
    offline: "Offline"
};

export interface StatusProps {
    headset: string | null;
}

export function HeadsetStatus({headset}: StatusProps) {

    const [status, setStatus] = useState<DeviceStatus | null>(null);
    const neurosity = useMemo(() => Register.neurosityAdapter, []);

    useEffect(() => {
        const subscription = neurosity.status$.subscribe((status) => {
            setStatus(status);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [neurosity]);

    if (!headset) {
        return <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            No device
        </Typography>
    }

    if (!status) {
        return <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Connecting...
        </Typography>
    }

    const battery = () => {
        if (status.charging) {
            if (status.battery < 20) return <BatteryCharging20/>;
            if (status.battery < 30) return <BatteryCharging20/>;
            if (status.battery < 50) return <BatteryCharging30/>
            if (status.battery < 60) return <BatteryCharging50/>
            if (status.battery < 80) return <BatteryCharging60/>
            if (status.battery < 90) return <BatteryCharging80/>
            if (status.battery < 100) return <BatteryCharging90/>
            return <BatteryChargingFull/>

        } else {
            if (status.battery < 20) return <BatteryAlert/>;
            if (status.battery < 30) return <Battery20/>
            if (status.battery < 50) return <Battery30/>
            if (status.battery < 60) return <Battery50/>
            if (status.battery < 80) return <Battery60/>
            if (status.battery < 90) return <Battery80/>
            if (status.battery < 100) return <Battery90/>
            return <BatteryFull/>
        }
    };

    return (
        <Box hidden={!status}>
            <Box sx={{verticalAlign: "middle"}} component="span">
                {battery()}
            </Box>
            <Typography variant="h6"
                        component="span">{headset} ({status.state in statesLabels ? statesLabels[status.state] : status.state})</Typography>
        </Box>
    );
}