import { PrismaClient } from "@prisma/client";
import { CreateCorreoDTO, UpdateCorreoDTO } from "./correo.schema";

const prisma = new PrismaClient();

export class CorreoService {

    async getAll(){
        return await prisma.correo.findMany({
            include: {
                area: true,
                dominio: true
            }
        })
    }

    async getById(id: number) {
        return await prisma.correo.findUnique({
            where: {
                id
            },
            select:{
                id: true,
                email: true,
                password: true,
                area: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                dominio: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    }

    async create(data: CreateCorreoDTO){
        const area = await prisma.area.findUnique({
            where: {
                id: data.areaId
            }
        })

        if(!area){
            throw new Error("Área no encontrada");
        }

        const dominio = await prisma.dominio.findUnique({
            where:{
                id: data.dominioId
            }
        })

        if(!dominio){
            throw new Error("Dominio no encontrado");
        }
        if(dominio.isActive === false){
            throw new Error("El dominio no está activo");
        }

        const email = data.localPart + "@" + dominio.name;
        return await prisma.correo.create({
            data: {
                email: email,
                password: data.password,
                areaId: data.areaId,
                dominioId: data.dominioId
            },
            include:{
                area: true,
                dominio: true
            }
        });
    }

    async update(id: number, data: UpdateCorreoDTO){
        const correo = await prisma.correo.findUnique({
            where: {
                id
            }
        });

        if(!correo){
            throw new Error("Correo no encontrado");
        }

        // Solo validar área si viene en data
        if(data.areaId){
            const area = await prisma.area.findUnique({
                where: {
                    id: data.areaId
                }
            });

            if(!area){
                throw new Error("Área no encontrada");
            }
        }

        // Solo validar dominio si viene en data
        if(data.dominioId){
            const dominio = await prisma.dominio.findUnique({
                where: {
                    id: data.dominioId
                }
            });

            if(!dominio){
                throw new Error("Dominio no encontrado");
            }
            if(dominio.isActive === false){
                throw new Error("El dominio no está activo");
            }
        }

        // Solo reconstruir email si cambia localPart O dominioId
        let emailNuevo: string | undefined = undefined;

        if(data.localPart || data.dominioId){
            // Determinar qué localPart usar
            const localPartFinal = data.localPart || correo.email.split('@')[0];
            
            // Determinar qué dominio usar
            let dominioFinal: string;
            if(data.dominioId){
                const dominioNuevo = await prisma.dominio.findUnique({ 
                    where: { id: data.dominioId } 
                });
                dominioFinal = dominioNuevo!.name; // Ya validamos que existe arriba
            } else {
                dominioFinal = correo.email.split('@')[1]; // Dominio actual del email
            }
            
            emailNuevo = localPartFinal + '@' + dominioFinal;
        }

        return await prisma.correo.update({
            where: {
                id: id
            },
            data: {
                ...(emailNuevo && { email: emailNuevo }),
                ...(data.password && { password: data.password }),
                ...(data.areaId && { areaId: data.areaId }),
                ...(data.dominioId && { dominioId: data.dominioId })
            },
            include: {
                area: true,
                dominio: true
            }
        });
    }

    async delete(id: number){
        return await prisma.correo.delete({
            where: {
                id: id
            }
        });
    }
}