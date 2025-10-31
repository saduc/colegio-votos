  import React, { useState, useEffect } from "react";
  import "./App.css";

  function App() {
    const [dni, setDni] = useState("");
    const [estudiante, setEstudiante] = useState(null);
    const [candidatos, setCandidatos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [resultados, setResultados] = useState([]);
    const [totalGeneral, setTotalGeneral] = useState(0);
    const [totalnulos, setTotalnulos] = useState(0);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [errorPass, setErrorPass] = useState("");
    const [votoRegistrado, setVotoRegistrado] = useState(false);
    const [candidatoVotado, setCandidatoVotado] = useState(null);
    const [contador, setContador] = useState(null);

    const backendURL = "http://localhost/colegio_votos/backend";
    const PASSWORD = "12345";

    const buscarEstudiante = async () => {
      setMensaje("");
      setEstudiante(null);
      setCandidatos([]);
      setVotoRegistrado(false);
      setCandidatoVotado(null);

      try {
        const res = await fetch(`${backendURL}/buscar_estudiante.php?dni=${dni}`);
        const data = await res.json();

        if (data.error) {
          setMensaje(data.error);
        } else {
          setEstudiante(data);

          const resCand = await fetch(`${backendURL}/obtener_candidatos.php`);
          const lista = await resCand.json();
          setCandidatos(lista);
        }
      } catch {
        setMensaje("⚠️ Error al conectar con el servidor.");
      }
    };

    const votar = async (idCandidato) => {
      try {
        const res = await fetch(`${backendURL}/registrar_voto.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dni, id_candidato: idCandidato }),
        });
        const data = await res.json();
        setMensaje(data.success || data.error);

        if (data.success) {
          setVotoRegistrado(true);
          setCandidatoVotado(idCandidato);
          cargarResultados();

          let segundos = 5;
          setContador(segundos);

          const interval = setInterval(() => {
            segundos -= 1;
            setContador(segundos);
            if (segundos === 0) {
              clearInterval(interval);
              resetearFormulario();
            }
          }, 1000);
        }
      } catch {
        setMensaje("⚠️ Error al registrar el voto.");
      }
    };

    const resetearFormulario = () => {
      setDni("");
      setEstudiante(null);
      setCandidatos([]);
      setVotoRegistrado(false);
      setCandidatoVotado(null);
      setMensaje("");
      setContador(null);
    };

    const cargarResultados = async () => {
  try {
    const res = await fetch(`${backendURL}/ver_votos.php`);
    const data = await res.json();

    // Si el backend devuelve .resultados (array)
    if (data && data.resultados) {
      setResultados(data.resultados || []);
      // Si el backend envía total_general o total_general está en otra propiedad, ajusta aquí:
      setTotalGeneral(data.total_general !== undefined ? Number(data.total_general) : 0);
      // total_nulos -> asignar seguro a totalnulos (tu variable de estado)
      setTotalnulos(data.total_nulos !== undefined ? Number(data.total_nulos) : 0);
    } else {
      // Valores por defecto si la respuesta no contiene resultados
      setResultados([]);
      setTotalGeneral(0);
      setTotalnulos(0);
    }
  } catch (err) {
    console.error("Error cargarResultados:", err);
    setMensaje("⚠️ No se pueden cargar los resultados.");
    // Mantener valores por defecto para evitar NaN en la UI
    setResultados([]);
    setTotalGeneral(0);
    setTotalnulos(0);
  }
};

    useEffect(() => {
      cargarResultados();
      const interval = setInterval(cargarResultados, 5000);
      return () => clearInterval(interval);
    }, []);

    const intentarAbrirMenu = () => {
      const pass = prompt("Ingrese la contraseña para ver resultados:");
      if (pass === PASSWORD) {
        setMenuAbierto(true);
        setErrorPass("");
      } else {
        setErrorPass("❌ Contraseña incorrecta");
      }
    };
    

    const resultadosPorGrado = resultados.reduce((acc, r) => {
      if (!acc[r.grado]) acc[r.grado] = [];
      acc[r.grado].push(r);
      return acc;
    }, {});

    // 🔮 IA: cálculo de predicción
    const agregadosPorCandidato = resultados.reduce((acc, r) => {
      const nombre = r.candidatos;
      const votos = Number(r.total_votos || 0);
      if (!nombre) return acc;
      acc[nombre] = (acc[nombre] || 0) + votos;
      return acc;
    }, {});
    const totalUsable = totalGeneral > 0 ? totalGeneral : Object.values(agregadosPorCandidato).reduce((s, v) => s + v, 0);
    const predicciones = Object.entries(agregadosPorCandidato)
      .map(([nombre, votos]) => ({
        candidatos: nombre,
        votos,
        probabilidad: totalUsable > 0 ? Number(((votos / totalUsable) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.votos - a.votos);
    const ganadorProbable = predicciones.length > 0 ? predicciones[0] : null;


    return (
      <div
        className="hero"
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f4f6f9",
          minHeight: "100vh",
        }}
      >
        <div className="hero-content">
          <header
            style={{
              width: "100%",
              background: "linear-gradient(to right, #03201eff, #0a3b1fff)",
              color: "#ffffffff",
              display: "flex",
              alignItems: "center",
              padding: "15px 20px",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1001,
            }}
          >
            <button
              onClick={intentarAbrirMenu}
              style={{
                fontSize: "28px",
                background: "transparent",
                border: "none",
                color: "#ffffffff",
                cursor: "pointer",
                marginRight: "15px",
              }}
            >
              ☰
            </button> 
          </header>
  <header
    style={{
      width: "100%",
      background: "linear-gradient(to right, #03201eff, #0a3b1fff)",
      color: "#ffffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // <-- importante
      padding: "15px 20px",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1001,
    }}
  >
    <div style={{ display: "flex", alignItems: "center" }}>
      <button
        onClick={intentarAbrirMenu}
        style={{
          fontSize: "28px",
          background: "transparent",
          border: "none",
          color: "#ffffffff",
          cursor: "pointer",
          marginRight: "15px",
        }}
      >
        ☰
      </button>
      
      <h2 style={{ margin: 0, fontSize: "30px" }}>
        🗳️ Elecciones Escolares 2025
      </h2>
    </div>

    {/* Logo del colegio al lado derecho */}
    <img
      src="/logo2.jpeg"
      alt="Logo del colegio"
      style={{
        width: "60px",
        height: "60px",
        marginRight: "40px", // <--- mueve a la izquierda
        borderRadius: "100%", // opcional para hacerlo redondo
        objectFit: "cover",
        opacity: 0.9,
        filter: "contrast(120%) brightness(95%)",
      }}
    />
  </header>


          {/* Menú lateral */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: menuAbierto ? 0 : "-400px",
              width: "300px",
              height: "100%",
              background: "#2c3e50",
              color: "#ffffffff",
              padding: "20px",
              boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
              transition: "left 0.3s ease",
              zIndex: 1002,
            }}
          >
            <button
              onClick={() => setMenuAbierto(false)}
              style={{
                fontSize: "20px",
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              ✖
            </button>
            <h3 style={{ borderBottom: "1px solid #fff", paddingBottom: "10px" }}>
              📊 Resultados por grado
            </h3>
            <div
              style={{
                maxHeight: "80vh",
                overflowY: "auto",
                marginTop: "15px",
              }}
            >
              {Object.keys(resultadosPorGrado).length > 0 ? (
                <>
                  {Object.keys(resultadosPorGrado).map((grado) => (
                    <div key={grado} style={{ marginBottom: "20px" }}>
                      <h4
                        style={{
                          borderBottom: "1px solid #bbb",
                          paddingBottom: "5px",
                        }}
                      >
                        🎓 {grado} GRADO
                      </h4>

                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {resultadosPorGrado[grado].map((r, i) => (
                          <li
                            key={i}
                            style={{
                              padding: "8px",
                              borderBottom: "1px solid #444",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{r.candidatos}</span>
                            <span>{r.total_votos} votos</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div
  style={{
    marginTop: "15px",
    padding: "10px",
    borderTop: "2px solid #fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "16px",
  }}
>
  🗳️ <strong>Total de votos válidos:</strong> {totalGeneral}
  <br />
  ❌ <strong>Votos nulos:</strong> {totalnulos}
  <br />
  📦 <strong>Total general:</strong> {Number(totalGeneral) + Number(totalnulos)}
</div>
                
                {/* GANADOR PROBABLE (if any) */}
                  {ganadorProbable && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px",
                        borderTop: "2px dashed #f1c40f",
                        textAlign: "center",
                        fontSize: "15px",
                        color: "#f1c40f",
                        fontWeight: "bold",
                      }}
                    >
                      🤖 Predicción IA: <span style={{ color: "#fff" }}>{ganadorProbable.candidatos}</span>
                      <div>({ganadorProbable.probabilidad}% de probabilidad de ganar)</div>
                    </div>
                  )}

                  {/* BARRITAS DE PREDICCIÓN */}
                  {predicciones.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "8px" }}>
                      <p style={{ textAlign: "center", marginBottom: "10px", color: "#f1c40f", fontWeight: "bold" }}>
                        Probabilidades por candidato
                      </p>

                      {predicciones.map((p, i) => (
                        <div key={i} style={{ marginBottom: "10px" }}>
                          <span style={{ display: "block", marginBottom: "5px", color: "#fff" }}>
                            {p.candidatos} — {p.probabilidad}%
                          </span>
                          <div
                            style={{
                              background: "#ddd",
                              borderRadius: "6px",
                              overflow: "hidden",
                              height: "18px",
                            }}
                          >
                            <div
                              style={{
                                width: `${p.probabilidad}%`,
                                background: i === 0 ? "#27ae60" : "#3498db",
                                height: "100%",
                                textAlign: "center",
                                color: "white",
                                fontSize: "12px",
                                lineHeight: "18px",
                              }}
                            >
                              {p.probabilidad}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p>No hay votos aún</p>
              )}
            </div>
          </div>

          {errorPass && (
            <p style={{ color: "red", textAlign: "center", marginTop: "80px" }}>
              {errorPass}
            </p>
          )}

          <div
            style={{
              maxWidth: "700px",
              margin: "100px auto 0 auto",
              padding: "10px",
            }}
          >
            {!estudiante && (
    <div style={{ textAlign: "center", marginBottom: "30px" }}>
      <h1 style={{ color: "#000000ff", fontWeight: "bold" }}>
        📢 Bienvenido al Sistema de Votación Escolar
      </h1>
      <p style={{ color: "#242323ff", fontSize: "16px", marginBottom: "15px" }}>
        Participa en las elecciones. Tu voto cuenta.
      </p>

      {/* Imagen de persona totalmente nítida */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="votación"
        style={{
          width: "120px",
          marginTop: "10px",
          filter: "none",         // asegura que no se le aplique filtro
          opacity: 1,             // 100% visible
          zIndex: 2,              // encima de la marca de agua
          position: "relative",   // evita que se mezcle con el fondo
        }}
      />

      {/* Cuadro de instrucciones sólido */}
      <div
        style={{
          marginTop: "20px",
          background: "#ece9e9ff",   // ← ahora fondo sólido blanco
          borderRadius: "12px",
          padding: "20px 25px",
          textAlign: "left",
          display: "inline-block",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
          zIndex: 2,               // asegura que esté encima del fondo
        }}
      >
        <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
          📝 Instrucciones:
        </h3>
        <ol style={{ paddingLeft: "20px", color: "#000", fontWeight: "500" }}>
          <li>Ingrese su DNI en el campo de abajo.</li>
          <li>Verifique sus datos.</li>
          <li>Seleccione su candidato y vote.</li>
        </ol>
      </div>
    </div>
  )}
            <div style={{ textAlign: "center" }}>
              
              <input
  type="text"
  placeholder="Ingrese su DNI"
  value={dni}
  onChange={(e) => setDni(e.target.value)}
  style={{
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #000000ff",
    width: "60%",
    marginRight: "10px",
  }}
/>
              <button
                onClick={buscarEstudiante}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#014716ff",
                  color: "#ffffffff",
                  cursor: "pointer",
                }}
              >
                Buscar
              </button>
            </div>

            {mensaje && (
              <p
                style={{
                  color: mensaje.includes("✅") ? "green" : "red",
                  textAlign: "center",
                  marginTop: "15px",
                  fontWeight: "bold",
                }}
              >
                {mensaje}
              </p>
            )}

            {estudiante && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  border: "1px solid #ff0000ff",
                  borderRadius: "8px",
                  background: "#ecf0f1",
                }}  
              >
                <h3 style={{ margin: "0 0 10px", color: "#2c3e50" }}> 
                  👩‍🎓 {estudiante.nombres}
                </h3>
                <p style={{ margin: 0 }}>
                  <strong>Grado:</strong> {estudiante.grado} <br />
                  <strong>Sección:</strong> {estudiante.seccion}
                </p>
              </div>
            )}

            {estudiante && (
              <div style={{ marginTop: "25px" }}>
                {votoRegistrado ? (
                  <div
                    style={{
                      padding: "20px",
                      border: "2px solid #27ae60",
                      borderRadius: "10px",
                      background: "#dff0d8",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#27ae60",
                      fontSize: "18px",
                    }}
                  >
                    ✅ Votaste por:
                    <div style={{ marginTop: "10px", fontSize: "22px" }}>
                      {candidatos.find(
                        (c) => c.id_candidato === candidatoVotado
                      )?.candidatos || "Candidato"}
                    </div>

                    {contador !== null && (
                      <h1
                        style={{
                          fontSize: "60px",
                          marginTop: "20px",
                          color: "#e74c3c",
                          fontWeight: "bold",
                        }}
                      >
                        Redirigiendo en {contador}...
                      </h1>
                    )}
                  </div>
                ) : candidatos.length > 0 ? (
                  <>
                    <h3 style={{ color: "#000000ff" }}>
                      📝 Seleccione un candidato:
                    </h3>
                   <div
  style={{
    display: "flex",
    gap: "20px",             // espacio entre cards
    justifyContent: "center", // centrado en la fila
  }}
>
  {candidatos.map((c) => (
    <div
      className="candidato-card"
      key={c.id_candidato}
      style={{
        width: "200px",
        padding: "15px",
        border: "1px solid #000000ff",
        borderRadius: "20px",
        background: "#817a7a27",
        textAlign: "center",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Foto */}
      <img
        src={`${backendURL}/uploads/candidatos/${c.foto}`}
        alt={c.candidatos}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "50%",
          marginBottom: "10px",
          border: "2px solid #3498db",
        }}
      />

      {/* Nombre */}
      <h4 style={{ margin: "0 0 10px", color: "#2c3e50" }}>{c.candidatos}</h4>

      {/* Botón */}
      <button
        onClick={() => votar(c.id_candidato)}
        style={{
          padding: "8px 15px",
          borderRadius: "8px",
          border: "none",
          background: "#27ae60",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Votar
      </button>
      
    </div>
  ))}
</div>
                  </>
                ) : (
                  <p style={{ textAlign: "center", color: "#555" }}>
                    No hay candidatos disponibles
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  export default App;
