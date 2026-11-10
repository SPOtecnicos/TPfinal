import { useState } from "react";
import Login from "./paginas/Login";
import Inicio from "./paginas/Inicio";
import Tienda from "./paginas/Tienda";
import Productos from "./paginas/Productos";
import Categorias from "./paginas/Categorias";
import Clientes from "./paginas/Clientes";
import Pedidos from "./paginas/Pedidos";
import Reportes from "./paginas/Reportes";
import Usuarios from "./paginas/Usuarios";

function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem("usuario")));
  const [pagina, setPagina] = useState("inicio");

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setPagina("inicio");
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  const menu = [
    { clave: "inicio", texto: "Inicio" },
    { clave: "tienda", texto: "Tienda" },
    { clave: "productos", texto: "Productos" },
    { clave: "categorias", texto: "Categorías" },
    { clave: "clientes", texto: "Clientes" },
    { clave: "pedidos", texto: "Pedidos" },
    { clave: "reportes", texto: "Reportes" },
  ];

  // solo el admin ve la gestión de usuarios
  if (usuario.rol === "admin") {
    menu.push({ clave: "usuarios", texto: "Usuarios" });
  }

  return (
    <div>
      <header className="barra">
        <h2>Ecommerce</h2>
        <nav>
          {menu.map((item) => (
            <button
              key={item.clave}
              className={pagina === item.clave ? "activo" : ""}
              onClick={() => setPagina(item.clave)}
            >
              {item.texto}
            </button>
          ))}
        </nav>
        <div className="sesion">
          <span>
            {usuario.nombre_usuario} ({usuario.rol})
          </span>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <main className="contenido">
        {pagina === "inicio" && <Inicio />}
        {pagina === "tienda" && <Tienda />}
        {pagina === "productos" && <Productos usuario={usuario} />}
        {pagina === "categorias" && <Categorias usuario={usuario} />}
        {pagina === "clientes" && <Clientes usuario={usuario} />}
        {pagina === "pedidos" && <Pedidos usuario={usuario} />}
        {pagina === "reportes" && <Reportes />}
        {pagina === "usuarios" && <Usuarios />}
      </main>
    </div>
  );
}

export default App;
