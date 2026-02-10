import { CorreoService } from "./correo.service";
import { Request, Response } from "express";
import { createCorreoSchema, updateCorreoSchema } from "./correo.schema";

const correoService = new CorreoService();

export class CorreoController {
    async getAll(req: Request, res: Response) {
        try{
            const correos = await correoService.getAll();
            return res.status(200).json(correos);
        } catch(e){
            return res.status(500).json({error: `Error al obtener todos los correos: ${e}`});
        }
    }

    async getById(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const correo = await correoService.getById(id);
            if(!correo){
                return res.status(404).json({message: "No existe el correo"});
            }
            return res.status(200).json(correo);
        }catch(e){
            return res.status(500).json({error: `Error al obtener el correo: ${e}`});
        }
    }

    async create(req: Request, res: Response) {
        try{
            const data = createCorreoSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({message: data.error});
            }

            const correo = await correoService.create(data.data);
            return res.status(201).json(correo);
        }catch(e){
            return res.status(400).json({error: `Error al crear el correo: ${e}`});
        }
    }

    async update(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const data = updateCorreoSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({message: data.error});
            }

            const correoActualizado = await correoService.update(id, data.data);
            return res.status(200).json(correoActualizado);

        }catch(e){
            return res.status(400).json({error: `Error al actualizar el correo: ${e}`});
        }
    }

    async delete(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const existe = await correoService.getById(id);
            if(!existe){
                return res.status(404).json({message: "Correo no encontrado"});
            }
            await correoService.delete(id);
            return res.status(204).send();
        }catch(e){
            return res.status(500).json({error: `Error al eliminar el correo: ${e}`});
        }
    }
}