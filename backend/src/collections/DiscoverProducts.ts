import type { CollectionConfig } from 'payload'

export const DiscoverProducts: CollectionConfig = {
  slug: 'discoverProducts',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'title', type: 'text' },
    { name: 'badge', type: 'text' },
    { name: 'bgColor', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
