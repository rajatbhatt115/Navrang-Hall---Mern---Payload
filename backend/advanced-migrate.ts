import { getPayload } from 'payload'
import configPromise from './src/payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dbPath = path.join(dirname, '..', 'backend-old', 'data', 'db.json')
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
const frontendPublicDir = path.join(dirname, '..', 'frontend', 'public')

const collections = [
  'homeBanners', 'discoverProducts', 'aboutContent', 'categories', 
  'testimonials', 'products', 'team', 'cartItems', 'wishlistItems', 
  'productDetails', 'innerBlog'
]
const globals = ['topRatingProducts', 'blogs']

// Helper to upload a file to Payload Media and return its ID
async function uploadMedia(payload: any, imagePath: string) {
  if (!imagePath || typeof imagePath !== 'string') return null;
  
  // Clean path
  let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(frontendPublicDir, cleanPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}, skipping upload.`);
    return null;
  }

  const fileName = path.basename(fullPath);
  const fileData = fs.readFileSync(fullPath);
  
  // Check if media already exists
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: fileName } }
  });
  
  if (existing.docs.length > 0) {
    return existing.docs[0].id;
  }

  try {
    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: fileName },
      file: {
        data: fileData,
        mimetype: 'image/' + path.extname(fileName).slice(1),
        name: fileName,
        size: fileData.length,
      }
    });
    return mediaDoc.id;
  } catch (err) {
    console.error('Error uploading media:', err);
    return null;
  }
}

// Recursively traverse and replace image strings with Media IDs
async function processDocument(payload: any, doc: any) {
  const newDoc = { ...doc };
  if (newDoc.id) {
    newDoc.oldId = newDoc.id;
    delete newDoc.id;
  }

  for (const key of Object.keys(newDoc)) {
    const val = newDoc[key];
    
    // Look for image-like paths
    if (typeof val === 'string' && (val.endsWith('.webp') || val.endsWith('.png') || val.endsWith('.jpg') || val.includes('pravatar.cc'))) {
      if (val.includes('pravatar.cc')) continue; // skip external avatars for now, keep as string
      
      const mediaId = await uploadMedia(payload, val);
      if (mediaId) {
        newDoc[key] = mediaId; // Replace string with relation ID
      }
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (typeof val[i] === 'object' && val[i] !== null) {
          val[i] = await processDocument(payload, val[i]);
        }
      }
    } else if (typeof val === 'object' && val !== null) {
      newDoc[key] = await processDocument(payload, val);
    }
  }
  return newDoc;
}

async function run() {
  console.log('Starting ADVANCED migration...')
  const payload = await getPayload({ config: configPromise })

  // Clear existing collections to avoid duplicates on re-run
  // Connect raw mongoose
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
  
  console.log('Clearing existing data (except users)...');
  
  const dbMongo = mongoose.connection.db;
  if (dbMongo) {
    const existingCols = await dbMongo.listCollections().toArray();
    for (const c of existingCols) {
      if (c.name !== 'users' && c.name !== 'payload-preferences') {
        try { await dbMongo.dropCollection(c.name); } catch(e) {}
      }
    }
  }

  // Migrate Collections
  for (const col of collections) {
    if (!db[col] || !Array.isArray(db[col])) continue
    
    console.log(`Migrating collection: ${col}`)
    for (const item of db[col]) {
      try {
        const processedItem = await processDocument(payload, item);
        
        // @ts-ignore
        await payload.create({
          collection: col,
          data: processedItem,
        })
      } catch (err) {
        console.error(`Error inserting into ${col}:`, err)
      }
    }
  }

  // Migrate Globals
  for (const glob of globals) {
    if (!db[glob]) continue
    
    console.log(`Migrating global: ${glob}`)
    try {
      const processedItem = await processDocument(payload, db[glob]);
      // @ts-ignore
      await payload.updateGlobal({
        slug: glob,
        data: processedItem,
      })
    } catch (err) {
      console.error(`Error updating global ${glob}:`, err)
    }
  }
  
  console.log('Advanced Migration complete!')
  process.exit(0)
}

run().catch(console.error)
