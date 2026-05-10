import type { GlobalConfig } from 'payload'

export const Blogs: GlobalConfig = {
  slug: 'blogs',
  access: { read: () => true, update: () => true },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        const populateMedia = async (obj: any) => {
          if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
              obj[i] = await populateMedia(obj[i]);
            }
          } else if (obj && typeof obj === 'object') {
            for (const key in obj) {
              if (key === 'image' || key === 'authorImage' || key === 'avatar') {
                if (typeof obj[key] === 'string' && obj[key].length === 24) {
                  try {
                    const media = await req.payload.findByID({
                      collection: 'media',
                      id: obj[key],
                      depth: 0,
                    });
                    if (media) {
                      obj[key] = media;
                    }
                  } catch (e) {
                    // Ignore errors if media not found
                  }
                }
              } else {
                obj[key] = await populateMedia(obj[key]);
              }
            }
          }
          return obj;
        };

        if (doc.homeBlogs) {
          doc.homeBlogs = await populateMedia(doc.homeBlogs);
        }
        if (doc.blogPages) {
          doc.blogPages = await populateMedia(doc.blogPages);
        }
        return doc;
      },
    ],
  },
  fields: [
    { name: 'homeBlogs', type: 'json' },
    { name: 'blogPages', type: 'json' },
  ],
}
