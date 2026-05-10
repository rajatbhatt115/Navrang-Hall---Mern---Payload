import type { CollectionConfig } from 'payload'

export const InnerBlog: CollectionConfig = {
  slug: 'innerBlog',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'title', type: 'text' },
    { name: 'content', type: 'text' },
    { name: 'author', type: 'text' },
    { name: 'date', type: 'text' },
    { name: 'authorImage', type: 'upload', relationTo: 'media' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'comments', type: 'array', fields: [
      { name: 'name', type: 'text' },
      { name: 'date', type: 'text' },
      { name: 'text', type: 'text' },
      { name: 'avatar', type: 'upload', relationTo: 'media' },
    ] },
  ],
}
