import React, {useState} from "react";
import {Box, Card, Container} from "@mui/material";

export function LoginComponent({onLogin, loading, error}) {
    const [deviceId, setDeviceId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function onSubmit(event) {
        event.preventDefault();
        onLogin({deviceId, email, password});
    }

    return (
        <Box mt="24px">
            <Container maxWidth="sm">
                <Card variant="outlined" >
                    <form className="card login-form" onSubmit={onSubmit}>
                        <h3 className="card-heading">Login</h3>
                        {!!error ? <h4 className="card-error">{error}</h4> : null}
                        <div className="row">
                            <label>Neurosity Device ID</label>
                            <input
                                type="text"
                                value={deviceId}
                                disabled={loading}
                                onChange={(e) => setDeviceId(e.target.value)}
                            />
                        </div>
                        <div className="row">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled={loading}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="row">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                disabled={loading}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="row">
                            <button type="submit" className="card-btn" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                </Card>
            </Container>
        </Box>
    );
}