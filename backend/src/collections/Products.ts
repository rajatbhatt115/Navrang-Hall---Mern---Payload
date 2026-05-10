import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'title', type: 'text' },
    { name: 'price', type: 'number' },
    { name: 'category', type: 'text' },
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
    { name: 'rating', type: 'number' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'isNew', type: 'checkbox' },
  ],
}
