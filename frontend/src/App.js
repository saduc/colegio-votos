import React, { useState, useEffect } from "react";
import "./App.css";
import { jsPDF } from "jspdf"; // <--- ¡NUEVO!
import InicioSesion from "./InicioSesion"; // Importar el nuevo componente

const AdminLogin = ({ onLogin, onCancel, error }) => {
  const [pass, setPass] = useState("");
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "300px", textAlign: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>🔒 Acceso Administrador</h3>
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box", borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {error && <p style={{ color: "red", fontSize: "14px", marginBottom: '10px' }}>{error}</p>}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button onClick={() => onLogin(pass)} style={{ flex: 1, padding: "10px", background: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: 'bold' }}>Entrar</button>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", background: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: 'bold' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

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
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [panelAdminAbierto, setPanelAdminAbierto] = useState(false);
  const [estadoVotacion, setEstadoVotacion] = useState("NO_INICIADA");
  const [inicioCount, setInicioCount] = useState(null);
  const [tiempoVotacion, setTiempoVotacion] = useState(0);
  const [historialVotaciones, setHistorialVotaciones] = useState([]);
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);




  const backendURL = "http://localhost/colegio_votos/backend";
  const CORRECT_CREDENTIALS = {
    username: "admin",
    password: "admin"
  };
  const PASSWORD = CORRECT_CREDENTIALS.password;


  const styles = {
    cardReporte: {
      background: "#fff",
      borderRadius: "15px",
      padding: "25px",
      textAlign: "center",
      boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
      transition: "transform 0.3s ease",
      border: "1px solid #eee"
    },
    iconContainer: {
      fontSize: "40px",
      marginBottom: "15px",
      background: "#f0f4f8",
      width: "80px",
      height: "80px",
      lineHeight: "80px",
      borderRadius: "50%",
      margin: "0 auto 15px auto"
    },
    cardText: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "20px",
      minHeight: "40px"
    },
    btnDownload: {
      background: "#2c3e50",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      width: "100%",
      fontWeight: "bold",
      fontSize: "14px"
    }
  };

  // useEffect para decrementar el contador de inicio cada segundo
  useEffect(() => {
    console.log("🔍 inicioCount:", inicioCount); // Debug

    if (inicioCount === null || inicioCount <= 0) return;

    const timer = setTimeout(() => {
      console.log("⏱️ Decrementando contador de", inicioCount, "a", inicioCount - 1);
      setInicioCount(inicioCount - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [inicioCount]);

  // useEffect para el cronómetro de votación (cuenta hacia arriba)
  useEffect(() => {
    // Solo contar si la votación está en curso Y el contador de inicio ya terminó (es 0 o null)
    if (estadoVotacion === "EN_CURSO" && (inicioCount === null || inicioCount <= 0)) {
      const timer = setInterval(() => {
        setTiempoVotacion(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [estadoVotacion, inicioCount]);

  // useEffect para cargar el historial desde localStorage al iniciar
  useEffect(() => {
    const historialGuardado = localStorage.getItem('historialVotaciones');
    if (historialGuardado) {
      try {
        setHistorialVotaciones(JSON.parse(historialGuardado));
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    }
  }, []);

  // useEffect para guardar el historial en localStorage cada vez que cambia
  useEffect(() => {
    if (historialVotaciones.length > 0) {
      localStorage.setItem('historialVotaciones', JSON.stringify(historialVotaciones));
    }
  }, [historialVotaciones]);



  // Función para eliminar un registro específico del historial
  const eliminarRegistro = (index) => {
    const nuevoHistorial = historialVotaciones.filter((_, i) => i !== index);
    setHistorialVotaciones(nuevoHistorial);
    // Si el historial queda vacío, limpiar localStorage
    if (nuevoHistorial.length === 0) {
      localStorage.removeItem('historialVotaciones');
    }
  };

  // Función para limpiar todo el historial
  const limpiarHistorial = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar todo el historial?")) {
      setHistorialVotaciones([]);
      localStorage.removeItem('historialVotaciones');
    }
  };

  const handleAdminLogin = (passwordInput) => {
    if (passwordInput === PASSWORD) {
      setIsAdminLoggedIn(true);
      setLoginError("");
      setShowLoginModal(false);
      // Si el panel de admin estaba intentando abrirse, ábrelo.
      if (showLoginModal) {
        setPanelAdminAbierto(true);
        setPanelAbierto(false);
      }
    } else {
      setLoginError("❌ Contraseña de administrador incorrecta");
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setPanelAdminAbierto(false);
    setPanelAbierto(false); // Cerrar ambos paneles
    setLoginError("");
  };

  const handleSalirSistema = () => {
    const pass = prompt("Ingrese la contraseña para salir del sistema:");
    if (pass === PASSWORD) {
      setAppUnlocked(false);
    } else if (pass !== null) { // Si no canceló
      alert("❌ Contraseña incorrecta");
    }
  };



  // ⬇️ AGREGA ESTO AQUÍ - EL COMPONENTE ADMIN PANEL
  const AdminPanel = ({ togglePanelAdmin, estadoVotacion, setEstadoVotacion, inicioCount, setInicioCount, tiempoVotacion, setTiempoVotacion, historialVotaciones, eliminarRegistro, limpiarHistorial }) => {
    const [activeTab, setActiveTab] = useState("Control");

    // Función para formatear el tiempo en HH:MM:SS
    const formatearTiempo = (segundos) => {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segs = segundos % 60;
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    };

    const iniciarVotacion = () => {
      console.log("🚀 Iniciando votación - estableciendo contador a 10");
      setEstadoVotacion("EN_CURSO");
      // Resetear el cronómetro
      setTiempoVotacion(0);
      // iniciar contador (ajusta segundos aquí)
      setInicioCount(10);
    };

    const finalizarVotacion = () => {
      // Guardar en el historial antes de resetear
      if (tiempoVotacion > 0) {
        const nuevoRegistro = {
          fecha: new Date().toLocaleDateString('es-ES'),
          hora: new Date().toLocaleTimeString('es-ES'),
          duracion: formatearTiempo(tiempoVotacion),
          duracionSegundos: tiempoVotacion
        };
        setHistorialVotaciones(prev => [nuevoRegistro, ...prev]); // Agregar al inicio
      }

      setEstadoVotacion("FINALIZADA");
      setInicioCount(null);
      // Resetear el cronómetro
      setTiempoVotacion(0);
      alert("❌ Votación finalizada");
    };

    const renderContent = () => {
      switch (activeTab) {
        case "Control":
          return (
            <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "10px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "15px" }}>
                Estado Actual del Escrutinio:
              </p>
              <div
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  background: estadoVotacion === "EN_CURSO" ? "#27ae60" :
                    estadoVotacion === "FINALIZADA" ? "#e74c3c" : "#f39c12",
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  fontSize: "16px",
                }}
              >
                {estadoVotacion.toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={iniciarVotacion}
                  disabled={estadoVotacion === "EN_CURSO"}
                  style={{
                    flex: 1,
                    background: estadoVotacion === "EN_CURSO" ? "#95a5a6" : "#27ae60",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: estadoVotacion === "EN_CURSO" ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    opacity: estadoVotacion === "EN_CURSO" ? 0.6 : 1,
                    transition: "all 0.3s ease",
                    fontSize: "14px",
                  }}
                >
                  ✅ INICIAR Votación
                </button>
                <button
                  onClick={finalizarVotacion}
                  disabled={estadoVotacion === "FINALIZADA"}
                  style={{
                    flex: 1,
                    background: estadoVotacion === "FINALIZADA" ? "#95a5a6" : "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: estadoVotacion === "FINALIZADA" ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    opacity: estadoVotacion === "FINALIZADA" ? 0.6 : 1,
                    transition: "all 0.3s ease",
                    fontSize: "14px",
                  }}
                >
                  ❌ FINALIZAR Votación
                </button>
              </div>
              <div style={{ marginTop: "15px", padding: "10px", background: "#fff", borderRadius: "6px", fontSize: "12px", color: "#666" }}>
                <strong>Estado:</strong> {estadoVotacion === "NO_INICIADA" && "🔴 Esperando inicio"}
                {estadoVotacion === "EN_CURSO" && "🟢 Votación en progreso"}
                {estadoVotacion === "FINALIZADA" && "🔴 Votación cerrada"}
              </div>
              {/* Mostrar el contador pequeño cuando esté activo */}
              {inicioCount !== null && inicioCount > 0 && (
                <div style={{ marginTop: "12px", textAlign: "center", fontWeight: "700", color: "#c0392b" }}>
                  {inicioCount > 0 ? `Inicio en: ${inicioCount}s` : "Iniciando..."}
                </div>
              )}

              {/* Mostrar el cronómetro cuando la votación está en curso */}
              {estadoVotacion === "EN_CURSO" && (inicioCount === null || inicioCount <= 0) && (
                <div style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "10px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#fff", marginBottom: "8px", fontWeight: "600" }}>
                    ⏱️ Tiempo transcurrido
                  </div>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#fff",
                    fontFamily: "monospace",
                    letterSpacing: "3px"
                  }}>
                    {formatearTiempo(tiempoVotacion)}
                  </div>
                </div>
              )}

              {/* Historial de votaciones */}
              {historialVotaciones.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    borderBottom: "2px solid #eee",
                    paddingBottom: "8px"
                  }}>
                    <h4 style={{ fontSize: "14px", color: "#555", margin: 0 }}>
                      📋 Historial de Sesiones
                    </h4>
                    <button
                      onClick={limpiarHistorial}
                      style={{
                        background: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Limpiar Todo
                    </button>
                  </div>

                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {historialVotaciones.map((registro, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#f8f9fa",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          border: "1px solid #e0e0e0",
                          fontSize: "12px",
                          position: "relative"
                        }}
                      >
                        <button
                          onClick={() => eliminarRegistro(index)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            background: "transparent",
                            border: "none",
                            color: "#999",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                          title="Eliminar registro"
                        >
                          ✖
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", paddingRight: "15px" }}>
                          <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                            Sesión #{historialVotaciones.length - index}
                          </span>
                          <span style={{ color: "#7f8c8d" }}>
                            {registro.fecha}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#555" }}>
                            🕐 {registro.hora}
                          </span>
                          <span style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "5px",
                            fontFamily: "monospace",
                            fontWeight: "bold"
                          }}>
                            ⏱️ {registro.duracion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

        case "Candidatos":
          return (
            <div style={{ padding: "20px" }}>
              <h3 style={{ marginBottom: "15px" }}>Gestión de Candidatos</h3>
              <input
                type="text"
                placeholder="Nombre del candidato"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginBottom: "10px",
                  boxSizing: "border-box",
                }}
              />
              <button
                style={{
                  width: "100%",
                  background: "#3498db",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Añadir Candidato
              </button>
            </div>
          );
        case "Auditoria":
          return (
            <div style={{ padding: "20px" }}>
              <h3>Auditoría de Votos</h3>
              <p>Información de auditoría del sistema de votación.</p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="admin-panel-container">
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            borderBottom: "1px solid #ddd",
            background: "#f5f5f5",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px" }}>⚙️ Administración</h2>
          <button
            onClick={togglePanelAdmin}
            style={{
              background: "#e74c3c",
              border: "none",
              color: "#fff",
              fontSize: "20px",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            ✖
          </button>
        </div>

        {/* Pestañas */}
        <div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
          {["Control", "Candidatos", "Auditoria"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "12px",
                background: activeTab === tab ? "#ff9800" : "#fff",
                color: activeTab === tab ? "#fff" : "#666",
                border: "none",
                cursor: "pointer",
                fontWeight: activeTab === tab ? "bold" : "normal",
                borderBottom: activeTab === tab ? "3px solid #ff9800" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ padding: "15px" }}>{renderContent()}</div>
      </div>
    );
  };


  const generarPDF = (tipo) => {
    const doc = new jsPDF();
    let y = 20;

    // Declaración de variable en el ámbito de la función (solución al error de alcance)
    let ganadorNombre = 'Ganador';

    // Asume que la variable totalPadron está disponible en el scope
    const totalPadron = window.totalPadron || 0;
    // Usamos Number() para asegurar que la suma sea numérica y no una concatenación de strings
    // CORRECCIÓN: Si totalGeneral ya incluye nulos, el total emitido es igual a totalGeneral
    const totalVotosEmitidos = Number(totalGeneral);
    const totalVotosValidos = Number(totalGeneral) - Number(totalnulos);

    // Cabecera: El título del reporte
    // Modificación: Solo mostrar el título genérico para reportes que no sean CERTIFICADO.
    if (tipo !== 'CERTIFICADO') {
      doc.setFontSize(18);
      doc.text(`ACTA DE RESULTADOS - ${tipo.replace('_', ' ')}`, 10, y);
      y += 15;
    }

    // --- LÓGICA CONDICIONAL POR TIPO DE REPORTE ---
    switch (tipo) {

      // 1. Lógica para ACTA_FINAL (Muestra Resumen General y Ganador)
      case "ACTA_FINAL":

        // 1. Resumen General
        doc.setFontSize(14);
        doc.text("Resumen General de Escrutinio:", 10, y);
        y += 7;

        // Totales Generales
        doc.setFontSize(12);
        doc.text(`Total Votos Válidos: ${totalVotosValidos}`, 15, y);
        y += 6;
        doc.text(`Total Votos Nulos/Blancos: ${totalnulos}`, 15, y);
        y += 6;
        doc.text(`Total General de Votos: ${totalVotosEmitidos}`, 15, y);
        y += 12;

        // 2. LÓGICA DE GANADOR FILTRADO
        const candidatosValidosActa = predicciones.filter(p => p.candidatos !== 'voto nulo');

        if (candidatosValidosActa.length > 0) {
          const ganadorRealActa = candidatosValidosActa[0];

          doc.setFontSize(16);
          doc.text("GANADOR DE LA ELECCIÓN:", 10, y);
          y += 7;

          doc.setFontSize(14);
          doc.text(`Candidato: ${ganadorRealActa.candidatos}`, 15, y);
          y += 6;

          doc.setFontSize(12);
          doc.text(`Votos obtenidos: ${ganadorRealActa.votos} votos (${ganadorRealActa.probabilidad}%)`, 15, y);

        } else {
          doc.setFontSize(12);
          doc.text("No hay candidatos con votos válidos para declarar un ganador.", 15, y);
        }
        y += 10;
        break;

      // 2. Lógica para CERTIFICADO (ESTILO DIPLOMA/TÍTULO - ORDENADO)
      case "CERTIFICADO":

        const candidatosValidosCert = predicciones.filter(p => p.candidatos !== 'voto nulo');

        // --- INICIO DEL ESTILO DIPLOMA/TÍTULO ---

        // 1. MARCO (Doble Borde Elegante)
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 200, 287); // Borde externo
        doc.setLineWidth(0.5);
        doc.rect(8, 8, 194, 281); // Borde interno

        // 2. ENCABEZADO SUPERIOR (Junta Electoral y Autoridad)
        let headerY = 20; // Nueva posición inicial para el encabezado
        doc.setFontSize(10);
        doc.text("JUNTA ELECTORAL DE LA INSTITUCIÓN", 105, headerY, { align: 'center' });
        headerY += 5;
        doc.setFontSize(8);
        doc.text("Autoridad Máxima del Escrutinio y Certificación", 105, headerY, { align: 'center' });

        y = 50; // Posición de inicio del título grande (Movido de 40 a 50)

        // 3. TÍTULO GRANDE Y FORMAL
        doc.setFontSize(24);
        doc.text("CERTIFICADO OFICIAL DE ELECCIÓN", 105, y, { align: 'center' });
        y += 20;

        // 4. TEXTO INTRODUCTORIO FORMAL
        doc.setFontSize(12);
        doc.text("Por cuanto se ha concluido satisfactoriamente el Proceso Electoral,", 105, y, { align: 'center' });
        y += 7;
        doc.text("la Junta Electoral ha determinado, mediante acta pública, que:", 105, y, { align: 'center' });
        y += 15;

        // 5. DECLARACIÓN DEL GANADOR (El punto central)
        if (candidatosValidosCert.length > 0) {
          const ganadorRealCert = candidatosValidosCert[0];

          // Asignamos el nombre para el nombre del archivo
          ganadorNombre = ganadorRealCert.candidatos;

          doc.setFontSize(18);
          doc.text("SE OTORGA EL PRESENTE DIPLOMA A:", 105, y, { align: 'center' });
          y += 10;

          doc.setFontSize(30);
          doc.setTextColor(50, 50, 150);
          doc.text(`${ganadorRealCert.candidatos.toUpperCase()}`, 105, y, { align: 'center' });
          doc.setTextColor(0, 0, 0); // Volver a negro
          y += 15;

          doc.setFontSize(16);
          doc.text("POR HABER SIDO OFICIALMENTE ELECTO COMO REPRESENTANTE.", 105, y, { align: 'center' });
          y += 15;

          doc.setFontSize(12);
          doc.text(`Con un total de ${ganadorRealCert.votos} votos válidos, equivalentes al ${ganadorRealCert.probabilidad}% de los votos válidos.`, 105, y, { align: 'center' });

          // --- INICIO DE SECCIÓN DE FIRMAS Y FECHA ORDENADA ---
          y = 260; // Posición base de las firmas

          // 6. FECHA Y LUGAR
          doc.setFontSize(10);
          doc.text(`Dado y certificado el ${new Date().toLocaleDateString()}.`, 105, y, { align: 'center' });
          y += 15;

          // 7. FIRMAS (Alineación horizontal mejorada)
          const lineY = y;
          const textY = y + 5;

          // Firma 1: Izquierda (Presidente)
          doc.line(30, lineY, 80, lineY);
          doc.text("[Firma del Presidente Electoral]", 55, textY, { align: 'center' });

          // Firma 2: Derecha (Secretario)
          doc.line(130, lineY, 180, lineY);
          doc.text("[Firma del Secretario Electoral]", 155, textY, { align: 'center' });


        } else {
          doc.setFontSize(12);
          doc.text("El proceso electoral no arrojó resultados válidos para declarar un ganador.", 105, y, { align: 'center' });
        }

        break;

      // 3. Lógica para ASISTENCIA (Muestra Participación)
      case "ASISTENCIA":
        // Cálculo de participación basado en el totalPadron

        let porcentajeParticipacion = 0;
        if (totalPadron > 0) {
          porcentajeParticipacion = ((totalVotosEmitidos / totalPadron) * 100).toFixed(2);
        }

        doc.setFontSize(16);
        doc.text("REPORTE DE PARTICIPACIÓN", 10, y);
        y += 10;

        doc.setFontSize(14);
        doc.text(`Electores Registrados (Padrón): ${totalPadron}`, 15, y);
        y += 6;

        doc.text(`Total Votos Emitidos: ${totalVotosEmitidos}`, 15, y);
        y += 6;

        doc.text(`Participación (%): ${porcentajeParticipacion}%`, 15, y);
        y += 10;

        doc.setFontSize(12);
        doc.text("-----------------------------------", 15, y);
        y += 6;
        doc.text(`Votos Válidos: ${totalGeneral}`, 15, y);
        y += 6;
        doc.text(`Votos Nulos/Blancos: ${totalnulos}`, 15, y);
        y += 10;

        break;

      // 4. Lógica para POR_GRADOS (Se mantiene igual)
      case "POR_GRADOS":
        doc.setFontSize(16);
        doc.text("Desglose de Votos por Grado:", 10, y);
        y += 10;

        Object.keys(resultadosPorGrado).forEach(grado => {

          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          const totalVotosGrado = resultadosPorGrado[grado].reduce((sum, r) => sum + Number(r.total_votos), 0);

          doc.setFontSize(14);
          doc.text(`GRADO: ${grado}`, 10, y);
          doc.line(10, y + 1, 100, y + 1);
          y += 5;

          resultadosPorGrado[grado].forEach(r => {
            doc.setFontSize(12);
            doc.text(`${r.candidatos}`, 15, y);
            doc.text(`${r.total_votos} votos`, 80, y);
            y += 5;
          });

          doc.setFontSize(12);
          doc.text("--------------------", 80, y);
          y += 5;
          doc.setFontSize(12);
          doc.text("TOTAL VOTOS GRADO:", 15, y);
          doc.text(`${totalVotosGrado} votos`, 80, y);
          y += 10;
        });

        break;

      default:
        doc.setFontSize(12);
        doc.text("Tipo de reporte no reconocido.", 10, y);
        break;
    }

    // Lógica de guardado que usa la variable del ámbito superior
    if (tipo !== "CERTIFICADO") {
      doc.save(`Acta_Elecciones_Reporte_${tipo}.pdf`);
    } else {
      // Usamos la variable 'ganadorNombre' y reemplazamos espacios para el nombre del archivo
      doc.save(`Certificado_Oficial_${ganadorNombre.replace(/\s/g, '_')}.pdf`);
    }
  };

  // Toggle Panel PDF (PROTEGIDO)
  const togglePanel = () => {
    setPanelAdminAbierto(false);
    if (panelAbierto) {
      setPanelAbierto(false);
    } else {
      isAdminLoggedIn ? setPanelAbierto(true) : setShowLoginModal(true);
    }
  };


  // Toggle Panel Admin (PROTEGIDO)
  const togglePanelAdmin = () => {
    setPanelAbierto(false);
    if (panelAdminAbierto) {
      setPanelAdminAbierto(false);
    } else {
      isAdminLoggedIn ? setPanelAdminAbierto(true) : setShowLoginModal(true);
    }
  };

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


  // 🔒 PANTALLA DE LOGIN PRINCIPAL
  if (!appUnlocked) {
    return (
      <InicioSesion
        onLogin={() => setAppUnlocked(true)}
        correctCredentials={CORRECT_CREDENTIALS}
      />
    );
  }

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
        <header className="app-header">
          {/* Lado izquierdo: menú + título */}
          <div className="header-left">
            <button
              onClick={intentarAbrirMenu}
              style={{
                fontSize: "30px",
                background: "transparent",
                border: "none",
                color: "#ffffffff",
                cursor: "pointer",
              }}
            >
              ☰
            </button>

            <h2 style={{ margin: 0, fontSize: "25px" }}>
              🗳️ Elecciones Escolares 2025
            </h2>
          </div>

          {/* CENTRO: Botones normales (PDF y Admin) */}
          <div className="header-center">
            {/* Botón Descarga PDF */}
            <button
              onClick={togglePanel}
              style={{
                fontSize: "18px",
                background: panelAbierto ? "#0a5723ff" : "#19580c88",
                border: "none",
                color: "#fff",
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: panelAbierto ? "0px 0px 10px #ffaa00ff" : "none",
                transform: panelAbierto ? "scale(1.05)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              📄 Descarga PDF
            </button>

            {/* Botón Administración */}
            <button
              onClick={togglePanelAdmin}
              style={{
                fontSize: "18px",
                background: panelAdminAbierto ? "#0a5723ff" : "#19580c88",
                border: "none",
                color: "#fff",
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: panelAdminAbierto ? "0px 0px 10px #ffaa00ff" : "none",
                transform: panelAdminAbierto ? "scale(1.05)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              ⚙️ Administración
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                style={{
                  fontSize: "18px",
                  background: "#c0392b",
                  border: "none",
                  color: "#fff",
                  padding: "8px 15px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginLeft: "10px"
                }}
              >
                Cerrar Sesión
              </button>
            )}

            {/* Botón para salir al login principal */}
            <button
              onClick={handleSalirSistema}
              style={{
                fontSize: "18px",
                background: "#19580c88",
                border: "none",
                color: "#fff",
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginLeft: "10px"
              }}
              title="Volver a la pantalla de bloqueo"
            >
              Salir
            </button>
          </div>

          {/* Lado derecho: logo */}
          <img
            src="/logo2.jpeg"
            alt="Logo del colegio"
            className="header-logo"
          />
        </header>

        {/* MUESTRA EL MODAL DE LOGIN SI ES NECESARIO */}
        {showLoginModal && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onCancel={() => { setShowLoginModal(false); setLoginError(''); }}
            error={loginError}
          />
        )}

        {/* PANEL PDF - AHORA REQUIERE isAdminLoggedIn */}
        {panelAbierto && isAdminLoggedIn && (
          <div className="pdf-panel-container">
            <div className="pdf-panel-content">
              {/* Cabecera del Panel */}
              <div className="pdf-panel-header">
                <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "28px" }}>📄 Centro de Reportes y Actas</h1>
                <button
                  onClick={togglePanel}
                  style={{
                    background: "#e74c3c",
                    border: "none",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                >
                  Cerrar
                </button>
              </div>

              {/* GRID DE OPCIONES DE DESCARGA */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "25px"
              }}>

                {/* TARJETA 1: ACTA FINAL */}
                <div style={styles.cardReporte}>
                  <div style={styles.iconContainer}>🏆</div>
                  <h3>Acta de Resultados</h3>
                  <p style={styles.cardText}>Documento oficial con el ganador, total de votos válidos, nulos y blancos.</p>
                  <button style={styles.btnDownload} onClick={() => generarPDF("ACTA_FINAL")}>
                    ⬇ Descargar Acta
                  </button>
                </div>

                {/* TARJETA 2: POR GRADOS */}
                <div style={styles.cardReporte}>
                  <div style={styles.iconContainer}>📊</div>
                  <h3>Desglose por Grados</h3>
                  <p style={styles.cardText}>Tabla detallada de votos obtenidos por cada candidato en cada salón/grado.</p>
                  <button style={styles.btnDownload} onClick={() => generarPDF("POR_GRADOS")}>
                    ⬇ Descargar Detalle
                  </button>
                </div>

                {/* TARJETA 3: LISTA DE VOTANTES */}
                <div style={styles.cardReporte}>
                  <div style={styles.iconContainer}>📋</div>
                  <h3>Padrón de Asistencia</h3>
                  <p style={styles.cardText}>Lista de estudiantes que registraron su voto (Auditoría de participación).</p>
                  <button style={styles.btnDownload} onClick={() => generarPDF("ASISTENCIA")}>
                    ⬇ Descargar Lista
                  </button>
                </div>

                {/* TARJETA 4: CERTIFICADO */}
                <div style={styles.cardReporte}>
                  <div style={styles.iconContainer}>🎖️</div>
                  <h3>Certificado de Victoria</h3>
                  <p style={styles.cardText}>Diploma honorífico generado automáticamente para el candidato ganador.</p>
                  <button style={styles.btnDownload} onClick={() => generarPDF("CERTIFICADO")}>
                    ⬇ Imprimir Diploma
                  </button>
                </div>

              </div>

              {/* SECCIÓN DE ESTADÍSTICAS RÁPIDAS (VISTA PREVIA) */}
              <div style={{ marginTop: "20px", padding: "20px", background: "#fff", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>ℹ️ Resumen para Impresión</h3>
                <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                  <li style={{ marginBottom: "10px" }}>📅 <strong>Fecha:</strong> {new Date().toLocaleDateString()}</li>
                  <li style={{ marginBottom: "10px" }}>🗳️ <strong>Total Votos Procesados:</strong> {Number(totalGeneral) + Number(totalnulos)}</li>
                  <li style={{ marginBottom: "60px" }}>⚡ <strong>Estado del Escrutinio:</strong> {Number(totalGeneral) > 0 ? "En Proceso / Finalizado" : "Sin datos"}</li>

                </ul>
              </div>

            </div>
          </div>
        )}

        {/* PANEL ADMIN - AHORA REQUIERE isAdminLoggedIn */}
        {panelAdminAbierto && isAdminLoggedIn && (
          <AdminPanel
            togglePanelAdmin={togglePanelAdmin}
            estadoVotacion={estadoVotacion}
            setEstadoVotacion={setEstadoVotacion}
            inicioCount={inicioCount}
            setInicioCount={setInicioCount}
            tiempoVotacion={tiempoVotacion}
            setTiempoVotacion={setTiempoVotacion}
            historialVotaciones={historialVotaciones}
            eliminarRegistro={eliminarRegistro}
            limpiarHistorial={limpiarHistorial}
            candidatos={candidatos}
            setCandidatos={setCandidatos}
          />
        )}
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
                  🗳️ <strong>Total de votos válidos:</strong> {Number(totalGeneral) - Number(totalnulos)}
                  <br />
                  ❌ <strong>Votos nulos:</strong> {totalnulos}
                  <br />
                  📦 <strong>Total general:</strong> {totalGeneral}
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
                {predicciones.length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "8px" }}>
                    <p style={{ textAlign: "center", marginBottom: "10px", color: "#f1c40f", fontWeight: "bold" }}>
                      🤖 Probabilidades por candidato
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

        <div className="main-content-container">
          {!estudiante && (
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1 style={{ color: "#000000ff", fontWeight: "bold" }}>
                📢 Bienvenido al Sistema de Votación Escolar
              </h1>
              <p style={{ color: "#000000ff", fontSize: "16px", marginBottom: "15px" }}>
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
          <div className="dni-input-container">

            <input
              type="text"
              placeholder="Ingrese su DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="dni-input"
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
            <div className="estudiante-info-card">
              <h3 style={{ margin: "0 0 10px", color: "#000000ff" }}>
                👩‍🎓 {estudiante.nombres}
              </h3>
              <p style={{ margin: 0 }}>
                <strong>Grado:</strong> {estudiante.grado}
                <br />
                <strong>Sección:</strong> {estudiante.seccion}
                <br />
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
                    background: "#c7d3c5ff",
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
                  <div style={{ width: "35%", textAlign: "left", marginTop: "20px", marginBottom: "20px", marginLeft: "19%" }}>
                    <h3 style={{ color: "#000000ff", margin: 0 }}>
                      😃Seleccione un candidato:
                    </h3>
                  </div>
                  <div className="candidatos-grid">
                    {candidatos.map((c) => (
                      <div
                        className="candidato-card candidato-card-responsive"
                        key={c.id_candidato}
                        style={{
                          padding: "15px",
                          border: "1px solid #000000ff",
                          borderRadius: "20px",
                          background: "#bdcabb9d",
                          textAlign: "center",
                          boxShadow: "0px 4px 10px rgba(5, 32, 11, 1)",
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

                        {/* Botón con clase de animación */}
                        <button
                          onClick={() => votar(c.id_candidato)}
                          className="button-votar"
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
