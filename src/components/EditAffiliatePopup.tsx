import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';


interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
}

interface Affiliate {
  tipoDocumento?: string;
  nroDocumento?: string;
  dni?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  planMedico?: string;
  plan?: string;
  credencial?: string;
  telefono?: string;
  telefono2?: string;
  email?: string;
  email2?: string;
  direccion?: string;
  direccion2?: string;
  situaciones?: Situacion[];
}

interface EditAffiliatePopupProps {
  affiliate: Affiliate;
  onClose: () => void;
  onSave: (data: Affiliate) => void;
}

export function EditAffiliatePopup({ affiliate, onClose, onSave }: EditAffiliatePopupProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: affiliate.tipoDocumento || "DNI",
    nroDocumento: affiliate.nroDocumento || affiliate.dni || "",
    nombres: affiliate.nombre || "",
    apellidos: affiliate.apellido || "",
    fechaNacimiento: affiliate.fechaNacimiento || "",
    planMedico: affiliate.planMedico || affiliate.plan || "",
    credencial: affiliate.credencial || "",
    telefono: affiliate.telefono || "",
    telefono2: affiliate.telefono2 || "",
    email: affiliate.email || "",
    email2: affiliate.email2 || "",
    direccion: affiliate.direccion || "",
    direccion2: affiliate.direccion2 || ""
  });

  const [situaciones, setSituaciones] = useState(
    affiliate.situaciones || [
      { situacion: "Operación Meniscal", fechaFinalizacion: "13/06/2024" },
      { situacion: "acompañamiento terapéutico", fechaFinalizacion: "-" }
    ]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave({ ...formData, situaciones });
    onClose();
  };

  const addNewField = (fieldType: string) => {
    console.log(`Agregar nuevo ${fieldType}`);
    alert(`Funcionalidad para agregar nuevo ${fieldType} será implementada`);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "20px",
        position: "relative"
      }}>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#666"
          }}
        >
          ✕
        </button>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ color: "#333", margin: 0 }}>Editar Afiliado</h1>
        </div>

        <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" }}>
          <h2 style={{ color: "#5FA92C", marginBottom: "15px", borderBottom: "2px solid #5FA92C", paddingBottom: "5px" }}>
            Datos de Afiliado
          </h2>
          
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", width: "20%", backgroundColor: "#f9f9f9" }}>
                  Tipo Documento (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", width: "30%" }}>
                  <select 
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  >
                    <option value="DNI">DNI</option>
                    <option value="LE">CUIL</option>
                    <option value="LE">CUIT</option>
                    <option value="LC">DOCUMENTO EXTRANJERO</option>
                    <option value="LE">LE</option>
                    <option value="LE">LC</option>
                    <option value="LE">CDI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", width: "20%", backgroundColor: "#f9f9f9" }}>
                  Nro Documento (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", width: "30%" }}>
                  <input 
                    type="text" 
                    name="nroDocumento"
                    value={formData.nroDocumento}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Nombres (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="text" 
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Apellidos (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="text" 
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Fecha nacimiento (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="date" 
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento.split('/').reverse().join('-')}
                    onChange={(e) => {
                      const date = e.target.value.split('-').reverse().join('/');
                      setFormData(prev => ({ ...prev, fechaNacimiento: date }));
                    }}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Plan Médico (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <select 
                    name="planMedico"
                    value={formData.planMedico}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  >
                    <option value="Integral 210">Integral 210</option>
                    <option value="Básico 110">Básico 110</option>
                    <option value="Premium 310">Premium 310</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Credencial
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {formData.credencial}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}></td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" }}>
          <h2 style={{ color: "#5FA92C", marginBottom: "15px", borderBottom: "2px solid #5FA92C", paddingBottom: "5px" }}>
            Situaciones Terapéuticas
          </h2>
          
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#5FA92C", color: "white" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Situación</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Fecha estimada de finalización</th>
              </tr>
            </thead>
            <tbody>
              {situaciones.map((sit, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input 
                      type="text" 
                      value={sit.situacion}
                      onChange={(e) => {
                        const newSituaciones = [...situaciones];
                        newSituaciones[index].situacion = e.target.value;
                        setSituaciones(newSituaciones);
                      }}
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input 
                      type="text" 
                      value={sit.fechaFinalizacion}
                      onChange={(e) => {
                        const newSituaciones = [...situaciones];
                        newSituaciones[index].fechaFinalizacion = e.target.value;
                        setSituaciones(newSituaciones);
                      }}
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            style={{ 
              marginTop: "15px", 
              padding: "8px 15px", 
              backgroundColor: "#5FA92C", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
            onClick={() => setSituaciones([...situaciones, { situacion: "", fechaFinalizacion: "" }])}
          >
            <AddIcon fontSize="small" />
            Agregar Situación
          </button>
        </div>

        <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" }}>
          <h2 style={{ color: "#5FA92C", marginBottom: "15px", borderBottom: "2px solid #5FA92C", paddingBottom: "5px" }}>
            Datos de Contacto
          </h2>
          
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", width: "20%", backgroundColor: "#f9f9f9" }}>
                  Teléfono (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", width: "30%" }}>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", width: "50%", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("teléfono")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo teléfono
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Teléfono 2
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="text" 
                    name="telefono2"
                    value={formData.telefono2}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("teléfono")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo teléfono
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Correo electrónico (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("correo")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo correo
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Correo electrónico 2
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="email" 
                    name="email2"
                    value={formData.email2}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("correo")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo correo
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Dirección (*)
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="text" 
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("domicilio")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo domicilio
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  Dirección 2
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input 
                    type="text" 
                    name="direccion2"
                    value={formData.direccion2}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button 
                    onClick={() => addNewField("domicilio")}
                    style={{ 
                      padding: "8px 15px", 
                      backgroundColor: "#5FA92C", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "0 auto"
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Agregar nuevo domicilio
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px" }}>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: "#5FA92C",
              color: "white",
              padding: "12px 25px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            Guardar Cambios
          </button>
          
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "12px 25px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}