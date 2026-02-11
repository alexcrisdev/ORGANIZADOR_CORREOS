import express from "express";
import cors from "cors";
import routerDominio from "./modules/dominio/dominio.routes";
import routerArea from "./modules/area/area.routes";
import routerCorreo from "./modules/correo/correo.routes";

const app = express(); //Crear el server

// CORS: permitir frontend local y el de produccion
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
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