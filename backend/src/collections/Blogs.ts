import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'date'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'oldId',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText', // Better than 'text'
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'date',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'authorImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'comments',
      type: 'array',
      fields: [
        {
          name: 'oldId',
          type: 'number',
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'date',
          type: 'text',
        },
        {
          name: 'text',
          type: 'textarea',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
