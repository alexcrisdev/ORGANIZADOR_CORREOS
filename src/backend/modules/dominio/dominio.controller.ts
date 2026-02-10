import { DominioService } from "./dominio.service";
import { Request, Response } from "express";
import { createDominioSchema, updateDominioSchema } from "./dominio.schema";

const servicioDominio = new DominioService();

export class DominioController {
    //1. Método para listar todos los dominios
    async getAll(req: Request, res: Response){
        try{
            const dominios = await servicioDominio.getAll();
            return res.status(200).json(dominios);
        }catch(e){
            return res.status(500).json({error: `Error al obtener los dominios: ${e}`});
        }
    }
    
    //2. Método para obtener por ID
    async getById(req: Request, res: Response){
        try{
            const id = Number(req.params.id);
            const dominio = await servicioDominio.getById(id);

            if(!dominio){
                return res.status(404).json({message: "Dominio no encontrado"});
            }

            return res.status(200).json(dominio);
        }catch(e){
            return res.status(500).json({error: `Error al obtener el dominio ${e}`});
        }
    }

    //3. Método para crear 
    async create(req: Request, res: Response){
        try{
            const data = createDominioSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({error: data.error});
            }

            const dominio = await servicioDominio.create(data.data);
            return res.status(201).json(dominio);
        }catch(e){
            return res.status(400).json({error: `Error al crear el dominio: ${e}`});
        }
    }

    //4. Método para actualizar
    async update(req: Request, res: Response){
        try{
            const id = Number(req.params.id);
            const data = updateDominioSchema.safeParse(req.body);

            if(!data.success){
                return res.status(400).json({error: data.error});
            }

            const dominioActualizado = await servicioDominio.update(id, data.data);
            return res.status(200).json(dominioActualizado);
        }catch(e){
            return res.status(500).json({error: `Error al actualizar el dominio: ${e}`})
        }
    }

    //5. Método para eliminar 
    async delete(req: Request ,res: Response){
        try{
            const id = Number(req.params.id);
            await servicioDominio.delete(id);
            return res.status(204).send();
        }catch(e){
            return res.status(500).json({error: `Error al eliminar el dominio: ${e}`});
        }
    }

    //6. Activar un dominio
    async activate(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const dominioActivado = await servicioDominio.activate(id);
            return res.status(200).json(dominioActivado);
        }catch(e){
            return res.status(500).json({error: `Error al activar el dominio: ${e}`});
        }
    }

    //7. Desactivar un dominio
    async deactivate(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            const dominioDesactivado = await servicioDominio.deactivate(id);
            return res.status(200).json(dominioDesactivado);
        }catch(e){
            return res.status(500).json({error: `Error al desactivar el dominio: ${e}`});
        }
    }
}

/**
🎧 El que escucha requests HTTP
🔍 El que valida datos de entrada
📞 El que llama al service
🛡️ El que maneja errores
📤 El que devuelve respuestas JSON con status codes
 */