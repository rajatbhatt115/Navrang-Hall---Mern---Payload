import type { CollectionConfig } from 'payload'

export const CartItems: CollectionConfig = {
  slug: 'cartItems',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'name', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'color', type: 'text' },
    { name: 'size', type: 'text' },
    { name: 'price', type: 'number' },
    { name: 'quantity', type: 'number' },
    { name: 'inStock', type: 'checkbox' },
  ],
}
