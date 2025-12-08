import React, { useState, useEffect } from "react";

// Colores Institucionales
const COLORS = {
    primary: "#1A237E", // Azul oscuro elegante (similar al corporativo)
    accent: "#FFB300",  // Dorado/Amarillo para énfasis
    text: "#333333",
    // Color del formulario: blanco ligeramente transparente para el efecto moderno
    backgroundForm: "rgba(255, 255, 255, 0.85)",
};

// ⚠️ Cambié `correctPassword` a `correctCredentials` para incluir el nombre de usuario
const InicioSesion = ({ onLogin, correctCredentials }) => {
    // Estado para Nombre de Administrador
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // 🛑 EFECTO PARA QUITAR EL SCROLL DEL BODY
    useEffect(() => {
        // Guardar el estilo original
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Aplicar hidden
        document.body.style.overflow = "hidden";

        // Restaurar al desmontar
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🆕 Lógica de Validación completa (Usuario y Contraseña)
        if (
            username === correctCredentials.username &&
            password === correctCredentials.password
        ) {
            onLogin(username); // Puedes pasar el nombre de usuario al loguearse si es útil
        } else {
            setError("❌ Credenciales incorrectas. Verifique Usuario y Contraseña.");
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: `2px solid ${error ? "#e74c3c" : "#e0e0e0"}`,
        fontSize: "16px",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.3s"
    };

    const inputFocusProps = {
        onFocus: (e) => e.target.style.borderColor = COLORS.primary,
        onBlur: (e) => !error && (e.target.style.borderColor = "#e0e0e0")
    };

    return (
        <div style={{
            height: "100vh",
            width: "100vw", // Asegura ancho completo
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Roboto, 'Segoe UI', Arial, sans-serif",
            padding: "20px",

            // 🛑 ESTILOS PARA QUITAR EL SCROLL
            overflowY: "hidden",
            overflowX: "hidden",

            // ESTILO DE FONDO
            backgroundImage: 'url("/fondo-mercedes.jpg")', // ⬅️ RUTA DE TU IMAGEN
            backgroundSize: 'cover',
            backgroundPosition: 'center',

            position: 'relative',
            zIndex: 0,
        }}>
            {/* 🔑 CAPA DE OVERLAY (Marca de Agua Oscura) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(2, 4, 4, 0.6)', // Oscurecido al 60%
                zIndex: 1,
            }} />

            {/* CONTENEDOR DEL FORMULARIO */}
            <div style={{
                background: COLORS.backgroundForm,
                padding: "40px",
                borderRadius: "15px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.25)",
                textAlign: "center",
                width: "100%",
                maxWidth: "400px",
                position: 'relative',
                zIndex: 2,

                // Efecto Glassmorphism
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
            }}>

                {/* LOGO DE LA I.E. */}
                <img
                    src="/logo-las-mercedes.png"
                    alt="Logo I.E.S Las Mercedes Juliaca"
                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "20px",

                    }}
                />

                <h1 style={{ color: COLORS.primary, margin: "0 0 5px 0", fontSize: "24px" }}>
                    I.E.S Las Mercedes
                </h1>
                <h2 style={{ color: COLORS.text, margin: "0 0 30px 0", fontSize: "18px", fontWeight: "400" }}>
                    🗳️ Acceso de Administración
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* CAMPO: NOMBRE DE ADMINISTRADOR */}
                    <input
                        name="admin"
                        type="text"
                        placeholder="Administrador"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError("");
                        }}
                        style={{ ...inputStyle, border: `2px solid ${error ? "#e74c3c" : "#e0e0e0"}` }}
                        {...inputFocusProps}
                    />

                    {/* CAMPO: CONTRASEÑA */}
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        style={inputStyle}
                        {...inputFocusProps}
                    />

                    {error && (
                        <p style={{ color: "#e74c3c", marginBottom: "20px", fontWeight: "bold", fontSize: "14px" }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: COLORS.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: `0 4px 10px ${COLORS.primary}40`,
                            transition: "background 0.3s, transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#1421a5ff"}
                        onMouseLeave={(e) => e.target.style.background = COLORS.primary}
                    >
                        INGRESAR AL SISTEMA
                    </button>
                </form>
                <p style={{ marginTop: "30px", fontSize: "15px", color: "black", textShadow: '0 0 1px #FFF' }}>
                    Sistema desarrollado para la I.E.S Las Mercedes - Juliaca
                </p>
            </div>
        </div>
    );
};

export default InicioSesion;