const fs = require('fs');
const path = require('path');

const db = require('./backend-old/data/db.json');

const collectionsDir = path.join(__dirname, 'backend', 'src', 'collections');
const globalsDir = path.join(__dirname, 'backend', 'src', 'globals');

if (!fs.existsSync(collectionsDir)) fs.mkdirSync(collectionsDir, { recursive: true });
if (!fs.existsSync(globalsDir)) fs.mkdirSync(globalsDir, { recursive: true });

function getType(val) {
  if (Array.isArray(val)) return 'array';
  if (val === null) return 'text';
  if (typeof val === 'object') return 'json';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'checkbox';
  return 'text';
}

function generateFields(obj) {
  if (!obj || typeof obj !== 'object') return [];
  const fields = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id') continue; 
    
    let type = getType(value);
    let fieldStr = '';
    
    // Check if it's a media field by key name or value signature
    if (key === 'image' || key === 'avatar' || key === 'authorImage' || 
       (typeof value === 'string' && (value.endsWith('.webp') || value.endsWith('.jpg') || value.endsWith('.png')))) {
      fieldStr = `    { name: '${key}', type: 'upload', relationTo: 'media'`;
    } else if (type === 'array' && value.length > 0 && typeof value[0] !== 'object') {
       fieldStr = `    { name: '${key}', type: 'json'`;
    } else if (type === 'array' && value.length > 0 && typeof value[0] === 'object') {
       fieldStr = `    { name: '${key}', type: 'array', fields: [\n${generateFields(value[0]).map(f => '  ' + f).join('\n')}\n    ]`;
    } else {
       fieldStr = `    { name: '${key}', type: '${type}'`;
    }
    
    fieldStr += ' },';
    fields.push(fieldStr);
  }
  return fields;
}

const collections = [
  'homeBanners', 'discoverProducts', 'aboutContent', 'categories', 
  'testimonials', 'products', 'team', 'cartItems', 'wishlistItems', 
  'productDetails', 'innerBlog'
];
const globals = ['topRatingProducts', 'blogs'];

const collectionExports = [];
const globalExports = [];

for (const col of collections) {
  const data = db[col];
  if (!data || !data[0]) continue;
  
  const fields = generateFields(data[0]);
  const capName = col.charAt(0).toUpperCase() + col.slice(1);
  collectionExports.push(capName);
  
  const content = `import type { CollectionConfig } from 'payload'

export const ${capName}: CollectionConfig = {
  slug: '${col}',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true }, // public for now
  fields: [
    { name: 'oldId', type: 'number', admin: { hidden: true } }, // to keep track of the original id
${fields.join('\n')}
  ],
}
`;
  fs.writeFileSync(path.join(collectionsDir, `${capName}.ts`), content);
}

for (const glob of globals) {
  const data = db[glob];
  if (!data) continue;
  
  const fields = generateFields(data);
  const capName = glob.charAt(0).toUpperCase() + glob.slice(1);
  globalExports.push(capName);
  
  const content = `import type { GlobalConfig } from 'payload'

export const ${capName}: GlobalConfig = {
  slug: '${glob}',
  access: { read: () => true, update: () => true },
  fields: [
${fields.join('\n')}
  ],
}
`;
  fs.writeFileSync(path.join(globalsDir, `${capName}.ts`), content);
}

// Generate payload.config.ts
const configContent = `import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
${collectionExports.map(c => `import { ${c} } from './collections/${c}'`).join('\n')}
${globalExports.map(g => `import { ${g} } from './globals/${g}'`).join('\n')}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cors: '*', // Allow all origins for the frontend
  collections: [Users, Media, ${collectionExports.join(', ')}],
  globals: [${globalExports.join(', ')}],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
`;

fs.writeFileSync(path.join(__dirname, 'backend', 'src', 'payload.config.ts'), configContent);
console.log('Schemas generated!');
