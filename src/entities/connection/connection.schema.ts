import { z } from 'zod'

export const connectionSchema = z
  .object({
    id: z.string().trim().min(1),
    sourceId: z.string().trim().min(1),
    targetId: z.string().trim().min(1),
    type: z.enum(['network', 'storage', 'contains']),
    status: z.enum(['active', 'inactive']),
  })
  .refine((connection) => connection.sourceId !== connection.targetId, {
    message: 'A connection cannot link a device to itself',
    path: ['targetId'],
  })

export type Connection = z.infer<typeof connectionSchema>
export type ConnectionId = Connection['id']
