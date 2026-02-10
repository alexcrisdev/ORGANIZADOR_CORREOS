import { Request, Response } from "express";
import { AreaService } from "./area.service";
import { createAreaSchema, updateAreaSchema } from "./area.schema";

const areaService = new AreaService();

export class AreaController {
    async getAll(req: Request, res: Response) {
        try{
            const areas = await areaService.getAll();
            return res.status(200).json(areas);
        }catch(e){
            return res.status(500).json({message: `Error al obtener las áreas: ${e}`});
        }
    }

    async getById(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const area = await areaService.getById(id);
            
            if(!area){
                return res.status(404).json({message: "Área no encontrada"});
            }

            return res.status(200).json(area);

        }catch(e){
            return res.status(500).json({message: `Error al obtener el área: ${e}`});
        }
    }

    async create(req: Request, res: Response) {
        try{
            const data = createAreaSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({error: data.error});
            }

            const area = await areaService.create(data.data);
            return res.status(201).json(area);
        }catch(e){
            //Errores del service
            return res.status(400).json({message: `Error al obtener el área: ${e}`});
        }
    }

    async update(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const data = updateAreaSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({error: data.error});
            }

            const areaActualizada = await areaService.update(id, data.data);
            return res.status(200).json(areaActualizada);
        }catch(e){
            //Errore del service
            return res.status(400).json({message: `Error al actualizar el área: ${e}`});
        }
    }

    async delete(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            await areaService.delete(id);
            return res.status(204).send();
        }catch(e){
            return res.status(500).json({message: `Error al eliminar el área: ${e}`});
        }
    }
}