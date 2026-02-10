import { PrismaClient } from "@prisma/client";
import { CreateDominioDTO, UpdateDominioDTO } from "./dominio.schema";

const prisma = new PrismaClient();

export class DominioService {
    //1. Función para obtener todos
    async getAll(){
        return await prisma.dominio.findMany({
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });
    }

    //2. Función para obtener uno
    async getById(id: number){
        return await prisma.dominio.findUnique({
            where: {id}
        })
    }

    //3. Función para crear
    async create(data: CreateDominioDTO){
        return await prisma.dominio.create({
            data
        });
    }

    //4. Función para actualizar
    async update(id: number, data: UpdateDominioDTO){
        return await prisma.dominio.update({
            where: {id},
            data
        });
    }

    //5. función para borrar
    async delete(id: number){
        return await prisma.dominio.delete({
            where: {id}
        })
    }

    //6. función para activar dominio
    async activate(id: number){
        return await prisma.dominio.update({
            where: {id},
            data: {isActive: true}
        })
    }

    //7. función para desactivar dominio
    async deactivate(id: number){
        return await prisma.dominio.update({
            where: {id},
            data: {isActive: false}
        });
    }
}

/**
El service solo habla con la BD
No sabe qué hacer con errores HTTP (404, 500, etc.)
Solo ejecuta operaciones y devuelve datos
 */