import express from "express";
import cors from "cors";
import routerDominio from "./modules/dominio/dominio.routes";
import routerArea from "./modules/area/area.routes";
import routerCorreo from "./modules/correo/correo.routes";

const app = express(); //Crear el server

app.use(cors());
app.use(express.json()); //Todo lo que entre, hablarán en idioma JSON

app.get("/health", (req,res)=>{
    res.json({status: "OK", message: "Server is running"});
})

// Rutas de la API
app.use("/api/dominios", routerDominio);
app.use("/api/areas", routerArea);
app.use("/api/correos", routerCorreo);

//404 handler (siempre al final)
app.use((req, res)=>{
    res.status(404).json({error: "Route not found"});
})

export default app;