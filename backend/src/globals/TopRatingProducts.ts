import type { GlobalConfig } from 'payload'

export const TopRatingProducts: GlobalConfig = {
  slug: 'topRatingProducts',
  access: { read: () => true, update: () => true },
  fields: [
    { name: 'kids', type: 'array', fields: [
      { name: 'title', type: 'text' },
      { name: 'price', type: 'text' },
      { name: 'rating', type: 'number' },
      { name: 'image', type: 'upload', relationTo: 'media' },
    ] },
    { name: 'women', type: 'array', fields: [
      { name: 'title', type: 'text' },
      { name: 'price', type: 'text' },
      { name: 'rating', type: 'number' },
      { name: 'image', type: 'upload', relationTo: 'media' },
    ] },
    { name: 'jewellery', type: 'array', fields: [
      { name: 'title', type: 'text' },
      { name: 'price', type: 'text' },
      { name: 'rating', type: 'number' },
      { name: 'image', type: 'upload', relationTo: 'media' },
    ] },
  ],
}
