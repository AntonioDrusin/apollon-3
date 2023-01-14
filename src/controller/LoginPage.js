// src/pages/Login.js
import React, { useState, useEffect } from "react";
import {LoginComponent} from "./LoginComponent";

export function LoginPage({ neurosity, user, setUser, setDeviceId }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    function onLogin({ email, password, deviceId }) {
        if (email && password && deviceId) {
            setError("");
            setEmail(email);
            setPassword(password);
            setDeviceId(deviceId);
        } else {
            setError("Please fill the form");
        }
    }

    useEffect(() => {
        if (!user && neurosity && email && password) {
            login();
        }

        async function login() {
            setIsLoggingIn(true);
            const auth = await neurosity.login({ email, password }).catch((error) => {
                setError(error.message);
            });

            if (auth) {
                setUser(auth.user);
            }

            setIsLoggingIn(false);
        }
    }, [email, password, neurosity, user, setUser, setError]);

    return <LoginComponent onLogin={onLogin} loading={isLoggingIn} error={error} />;
}