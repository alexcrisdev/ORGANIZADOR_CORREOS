import { PrismaClient } from "@prisma/client";
import { CreateAreaDTO, UpdateAreaDTO } from "./area.schema";

const prisma = new PrismaClient();

export class AreaService {

    //Obtener todas las áreas
    async getAll(){
        return await prisma.area.findMany({
            include: {
                areaDominios: {
                    include: {
                        dominio: true
                    }
                }
            }
        });
    }

    //Obtener un área por ID
    async getById(id: number){
        return await prisma.area.findUnique({
            where: {id},
            include: {
                areaDominios: {
                    include: {
                        dominio: true
                    }
                }
            }
        });
    }

    //Crear un área nueva y vincular dominios (find or create pattern)
    async create(data: CreateAreaDTO){
        //Validación: Verificar que los dominios existan y estén activados
        const dominios = await prisma.dominio.findMany({
            where: {
                id: {in: data.dominios} //Busca todos los IDs que vienen
            }
        });

        //Validar que TODOS los dominios existan
        if(dominios.length !== data.dominios.length){
            throw new Error("Uno o más dominios no existen");
        }

        //Validar que TODOS estén activos
        const dominiosInActivos = dominios.filter(d => !d.isActive);
        if(dominiosInActivos.length > 0){
            const nombres = dominiosInActivos.map(d => d.name).join(', ');
            throw new Error(`Los dominios ${nombres} están inactivos`);
        }

        // FIND OR CREATE: Buscar si el área ya existe
        let area = await prisma.area.findUnique({
            where: { name: data.name }
        });

        // Si no existe, crearla
        if(!area){
            area = await prisma.area.create({
                data: { name: data.name }
            });
        }

        // Obtener vínculos existentes para evitar duplicados
        const vinculosExistentes = await prisma.areaDominio.findMany({
            where: { areaId: area.id }
        });

        const dominiosYaVinculados = vinculosExistentes.map(v => v.dominioId);

        // Filtrar solo los dominios nuevos (sin vínculos previos)
        const dominiosNuevos = data.dominios.filter(domainId => 
            !dominiosYaVinculados.includes(domainId)
        );

        // Crear solo los vínculos nuevos
        if(dominiosNuevos.length > 0){
            await prisma.areaDominio.createMany({
                data: dominiosNuevos.map(domainId => ({
                    areaId: area.id,
                    dominioId: domainId
                }))
            });
        }

        // Retornar el área con todos sus vínculos
        return await prisma.area.findUnique({
            where: { id: area.id },
            include: {
                areaDominios: {
                    include: {
                        dominio: true
                    }
                }
            }
        });
    }

    async update(id: number, data: UpdateAreaDTO){
        //Si vienen dominios nuevos, validar
        if(data.dominios){
            const dominios = await prisma.dominio.findMany({
                where: {
                    id: {in: data.dominios}
                }
            });

            if(dominios.length !== data.dominios.length){
                throw new Error("Uno o más dominios no existen");
            }

            const inactivos = dominios.filter(d => !d.isActive);
            if(inactivos.length > 0){
                throw new Error(`Los dominios ${inactivos.map(d => d.name).join(', ')} están inactivos`)
            }
        }

        //Si cambias dominios, primero se borran los vínculos viejos
        if(data.dominios){
            await prisma.areaDominio.deleteMany({
                where: {
                    areaId: id
                }
            })
        }

        //Luego actualizar el área (nombre y/o crea nuevos vínculos)
        return await prisma.area.update({
            where: {id},
            data: {
                name: data.name,
                areaDominios: data.dominios ? {
                    create: data.dominios.map(domainId => ({
                        dominioId: domainId
                    }))
                } : undefined
            },
            include: {
                areaDominios: {
                    include: {
                        dominio: true
                    }
                }
            }
        });
    }

    async delete(id: number){
        return await prisma.area.delete({where: {id}});
    }
}