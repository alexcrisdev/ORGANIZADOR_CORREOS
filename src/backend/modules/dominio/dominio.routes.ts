import { Router } from "express";
import { DominioController } from "./dominio.controller";

const routerDominio = Router();

const dominioController = new DominioController();

routerDominio.get("/", dominioController.getAll.bind(dominioController));
routerDominio.get("/:id", dominioController.getById.bind(dominioController));
routerDominio.post("/", dominioController.create.bind(dominioController));
routerDominio.put("/:id", dominioController.update.bind(dominioController));
routerDominio.delete("/:id", dominioController.delete.bind(dominioController));
routerDominio.patch("/:id/activate", dominioController.activate.bind(dominioController));
routerDominio.patch("/:id/deactivate", dominioController.deactivate.bind(dominioController));

export default routerDominio;
