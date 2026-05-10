import type { CollectionConfig } from 'payload'

export const ProductDetails: CollectionConfig = {
  slug: 'productDetails',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number' }, // to keep track of the original id
    { name: 'name', type: 'text' },
    { name: 'price', type: 'number' },
    { name: 'rating', type: 'number' },
    { name: 'largeImage', type: 'upload', relationTo: 'media' },
    { name: 'thumbnails', type: 'array', minRows: 3, maxRows: 3, fields: [
      { name: 'image', type: 'upload', relationTo: 'media' },
    ] },
    { 
      name: 'sizes', 
      type: 'select', 
      hasMany: true, 
      options: [
        { label: 'XS', value: 'XS' },
        { label: 'S', value: 'S' },
        { label: 'M', value: 'M' },
        { label: 'L', value: 'L' },
        { label: 'XL', value: 'XL' },
        { label: 'XXL', value: 'XXL' },
        { label: 'One Size', value: 'One Size' }
      ]
    },
    { name: 'description', type: 'text' },
    { name: 'reviews', type: 'array', fields: [
      { name: 'name', type: 'text' },
      { name: 'rating', type: 'number' },
      { name: 'text', type: 'text' },
      { name: 'avatar', type: 'upload', relationTo: 'media' },
    ] },
  ],
}
