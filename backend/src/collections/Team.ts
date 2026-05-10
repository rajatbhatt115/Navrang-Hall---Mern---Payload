import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'name', type: 'text' },
    { name: 'role', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
