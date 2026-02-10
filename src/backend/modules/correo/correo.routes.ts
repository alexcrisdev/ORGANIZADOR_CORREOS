import { Router } from "express";
import { CorreoController } from "./correo.controller";

const router = Router();
const correoController = new CorreoController();

router.get("/", correoController.getAll.bind(correoController));
router.get("/:id", correoController.getById.bind(correoController));
router.post("/", correoController.create.bind(correoController));
router.put("/:id", correoController.update.bind(correoController));
router.delete("/:id", correoController.delete.bind(correoController));

export default router;