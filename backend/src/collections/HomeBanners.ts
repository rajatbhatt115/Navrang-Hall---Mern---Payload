import type { CollectionConfig } from 'payload'

export const HomeBanners: CollectionConfig = {
  slug: 'homeBanners',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'buttonText', type: 'text' },
    { name: 'buttonLink', type: 'text' },
    { name: 'imageUrl', type: 'upload', relationTo: 'media' },
  ],
}
