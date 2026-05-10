import type { CollectionConfig } from 'payload'

export const AboutContent: CollectionConfig = {
  slug: 'aboutContent',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
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
                    // Ignore errors
                  }
                }
              } else {
                obj[key] = await populateMedia(obj[key]);
              }
            }
          }
          return obj;
        };

        if (doc.founder) doc.founder = await populateMedia(doc.founder);
        if (doc.mission) doc.mission = await populateMedia(doc.mission);
        if (doc.awards) doc.awards = await populateMedia(doc.awards);
        return doc;
      },
    ],
  },
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
    { name: 'experienceTitle', type: 'text' },
    { name: 'experienceTexts', type: 'json' },
    { name: 'founder', type: 'json' },
    { name: 'mission', type: 'json' },
    { name: 'awards', type: 'json' },
    { name: 'historyTitle', type: 'text' },
    { name: 'historySubtitle', type: 'text' },
    { name: 'timeline', type: 'array', fields: [
      { name: 'year', type: 'text' },
      { name: 'text', type: 'text' },
    ] },
  ],
}
