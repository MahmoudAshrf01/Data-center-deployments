import { z } from 'zod'

export const deviceTypeSchema = z.enum(['server', 'switch', 'storage', 'rack'])

export const deviceStatusSchema = z.enum([
  'pending',
  'deploying',
  'deployed',
  'failed',
  'decommissioning',
])

export const deviceSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: deviceTypeSchema,
    status: deviceStatusSchema,
    rackId: z.string().trim().min(1).nullable(),
    progress: z.number().finite().min(0).max(100),
  })
  .superRefine((device, context) => {
    if (device.status === 'deployed' && device.progress !== 100) {
      context.addIssue({
        code: 'custom',
        message: 'A deployed device must have 100 percent progress',
        path: ['progress'],
      })
    }
  })

export type Device = z.infer<typeof deviceSchema>
export type DeviceId = Device['id']
export type DeviceStatus = Device['status']
export type DeviceType = Device['type']
