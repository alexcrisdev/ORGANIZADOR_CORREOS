import z from "zod";

export const createDominioSchema = z.object({
    name: z.string().min(1, "Name is required"),
    isActive: z.boolean().optional().default(true)
});

export const updateDominioSchema = z.object({
    name: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
}).refine(data => data.name !== undefined || data.isActive !== undefined, {
    message: "At least one field must be provided",
})

//.refine -> validación extra

export type CreateDominioDTO = z.infer<typeof createDominioSchema>;
export type UpdateDominioDTO = z.infer<typeof updateDominioSchema>;