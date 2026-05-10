import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HomeBanners } from './collections/HomeBanners'
import { DiscoverProducts } from './collections/DiscoverProducts'
import { AboutContent } from './collections/AboutContent'
import { Categories } from './collections/Categories'
import { Testimonials } from './collections/Testimonials'
import { Products } from './collections/Products'
import { Team } from './collections/Team'
import { CartItems } from './collections/CartItems'
import { WishlistItems } from './collections/WishlistItems'
import { ProductDetails } from './collections/ProductDetails'
import { InnerBlog } from './collections/InnerBlog'
import { TopRatingProducts } from './globals/TopRatingProducts'
import { Blogs } from './globals/Blogs'

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
  collections: [Users, Media, HomeBanners, DiscoverProducts, AboutContent, Categories, Testimonials, Products, Team, CartItems, WishlistItems, ProductDetails, InnerBlog],
  globals: [TopRatingProducts, Blogs],
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
