import z from "zod";

export const createAreaSchema = z.object({
    name: z.string().min(1, "Name area is required"),
    dominios: z.array(z.number()).min(1, "At least one dominio is required")
});

export const updateAreaSchema = z.object({
    name: z.string().min(1).optional(),
    dominios: z.array(z.number()).min(1).optional()
}).refine(data => data.name !== undefined || data.dominios !== undefined, {
    message: "At least one field must be provided",
})

export type CreateAreaDTO = z.infer<typeof createAreaSchema>;
export type UpdateAreaDTO = z.infer<typeof updateAreaSchema>;