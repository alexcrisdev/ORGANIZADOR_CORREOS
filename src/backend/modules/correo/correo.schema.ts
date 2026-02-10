import z from "zod";

export const createCorreoSchema = z.object({
    localPart: z.string().min(1).max(64), //Parte antes del @
    password: z.string().min(1),
    areaId: z.number().int().positive(),
    dominioId: z.number().int().positive()
});

export const updateCorreoSchema = z.object({
    localPart: z.string().min(1).max(64).optional(), //Parte antes del @
    password: z.string().min(1).optional(),
    areaId: z.number().int().positive().optional(),
    dominioId: z.number().int().positive().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "Debes enviar al menos un campo para actualizar"
    }
);

export type CreateCorreoDTO = z.infer<typeof createCorreoSchema>;
export type UpdateCorreoDTO = z.infer<typeof updateCorreoSchema>;