import type { GlobalConfig } from 'payload'

export const BlogSettings: GlobalConfig = {
  slug: 'blog-settings',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'homeBlogs',
      type: 'group',
      fields: [
        {
          name: 'mainBlog',
          type: 'relationship',
          relationTo: 'blogs' as any,
          required: false,
        },
        {
          name: 'smallBlogs',
          type: 'relationship',
          relationTo: 'blogs' as any,
          hasMany: true,
          required: false,
        },
      ],
    },
    {
      name: 'blogPages',
      type: 'array',
      fields: [
        {
          name: 'pageNumber',
          type: 'number',
          required: true,
        },
        {
          name: 'mainBlogs',
          type: 'relationship',
          relationTo: 'blogs' as any,
          hasMany: true,
        },
        {
          name: 'smallBlogs',
          type: 'relationship',
          relationTo: 'blogs' as any,
          hasMany: true,
        },
      ],
    },
  ],
}
