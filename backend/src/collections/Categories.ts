import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
