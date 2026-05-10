// @ts-ignore
import { getPayload } from 'payload'
import configPromise from './src/payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import dotenv from 'dotenv'

dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dbPath = path.join(dirname, '..', 'backend-old', 'data', 'db.json')
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

const collections = [
  'homeBanners', 'discoverProducts', 'aboutContent', 'categories', 
  'testimonials', 'products', 'team', 'cartItems', 'wishlistItems', 
  'productDetails', 'innerBlog'
]

const globals = ['topRatingProducts', 'blogs']

async function run() {
  console.log('Starting migration...')
  const payload = await getPayload({
    config: configPromise,
  })

  // Migrate Collections
  for (const col of collections) {
    if (!db[col] || !Array.isArray(db[col])) continue
    
    console.log(`Migrating collection: ${col}`)
    for (const item of db[col]) {
      try {
        const dataToInsert = { ...item, oldId: item.id }
        delete dataToInsert.id // Payload creates its own ID
        
        // @ts-ignore: dynamically resolving collection slug
        await payload.create({
          collection: col,
          data: dataToInsert,
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
      // @ts-ignore: dynamically resolving global slug
      await payload.updateGlobal({
        slug: glob,
        data: db[glob],
      })
    } catch (err) {
      console.error(`Error updating global ${glob}:`, err)
    }
  }

  // Create admin user
  try {
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'admin@example.com' }
      }
    });

    if (existingUsers.totalDocs === 0) {
        console.log('Creating admin user...')
        await payload.create({
          collection: 'users',
          data: {
            email: 'admin@example.com',
            password: 'password123',
          },
        })
    }
  } catch(err) {
    console.error('Error creating admin:', err)
  }

  console.log('Migration complete!')
  process.exit(0)
}

run().catch(console.error)
