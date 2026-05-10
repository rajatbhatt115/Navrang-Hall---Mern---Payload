import type { CollectionConfig } from 'payload'

export const ProductDetails: CollectionConfig = {
  slug: 'productDetails',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'name', type: 'text' },
    { name: 'price', type: 'number' },
    { name: 'rating', type: 'number' },
    { name: 'images', type: 'array', fields: [
      { name: 'thumb', type: 'upload', relationTo: 'media' },
      { name: 'large', type: 'upload', relationTo: 'media' },
    ] },
    { name: 'sizes', type: 'json' },
    { name: 'description', type: 'text' },
    { name: 'reviews', type: 'array', fields: [
      { name: 'name', type: 'text' },
      { name: 'rating', type: 'number' },
      { name: 'text', type: 'text' },
      { name: 'avatar', type: 'upload', relationTo: 'media' },
    ] },
  ],
}
