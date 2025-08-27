// Get all posts
export const POSTS_QUERY = `*[_type == "post"] | order(_createdAt desc) {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  description,
  mainImage,
  categories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
  },
  "imageUrl": mainImage.asset->url,
  "author": author->{
    _id,
    name,
    image,
    bio,
    "slug": slug.current
  }
}`

// Get a single post by slug
export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  mainImage,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        ...,
        metadata
      }
    }
  },
  "date": _createdAt,
  "publishedAt": _createdAt,
  "author": author->{
    _id,
    name,
    image,
    bio
  }
}`

// Get all categories
export const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description
}`

// Get posts by category
export const POSTS_BY_CATEGORY_QUERY = `*[_type == "post" && references($categoryId)] | order(_createdAt desc) {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  description,
  mainImage,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`

// Get recent posts (for homepage or sidebar)
export const RECENT_POSTS_QUERY = `*[_type == "post"] | order(_createdAt desc) [0...4] {
  _id,
  "slug": slug.current,
  title,
  description,
  _createdAt,
  "imageUrl": mainImage.asset->url
}`

// For generating sitemap or similar
export const ALL_POST_SLUGS_QUERY = `*[_type == "post" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`
