// Base Sanity types
export type SanityReference = {
	_ref: string
	_type: 'reference'
}

export type SanitySlug = {
	_type: 'slug'
	current: string
}

export type SanityImage = {
	_type: 'image'
	asset: SanityReference
	alt?: string
	hotspot?: {
		x: number
		y: number
		height: number
		width: number
	}
	crop?: {
		top: number
		bottom: number
		left: number
		right: number
	}
}

export type SanityPost = {
	_id: string;
	title: string;
	description: string | null;
	slug: string;
	categories: Category[];
	imageUrl: string | null;
	author: Author | null;
	_createdAt: string;
};

// Portable Text types (replacing next-sanity's PortableTextBlock)
export type PortableTextBlock = {
	_type: 'block'
	_key: string
	style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote'
	listItem?: 'bullet' | 'number'
	markDefs?: Array<{
		_key: string
		_type: string
		[key: string]: any
	}>
	children: Array<{
		_type: 'span'
		_key: string
		text: string
		marks?: string[]
	}>
}

export type PortableTextImage = {
	_type: 'image'
	_key: string
	asset: SanityReference
	alt?: string
	caption?: string
}

export type PortableTextContent = Array<PortableTextBlock | PortableTextImage | any>

// Domain types
export type Author = {
	_id: string;
	name: string;
	slug: string;
	image?: SanityImage;
	bio: string | null;
}

export type Category = {
	_id: string
	_type: 'category'
	title: string
	slug: string
	description?: string
}

export type Post = {
	title: string
	slug: string
	description?: string
	mainImage?: SanityImage
	imageUrl?: string // Resolved image URL from query
	categories?: string[]
	author: Author | null
	body?: PortableTextContent
	publishedAt?: string
	date?: string
}

// API Response types
export type PostsResponse = SanityPost[]
export type PostResponse = SanityPost | null
export type CategoriesResponse = Category[]

// Form types for email/contact
export type ContactFormData = {
	name: string
	email: string
	subject: string
	message: string
}

export type SubscriptionFormData = {
	email: string
}

// UI Component Props types
export type PostCardProps = {
	post: Post
}

export type PostFilterProps = {
	categories: Category[]
	selectedCategory: string | null
	onCategoryChange: (categoryId: string | null) => void
}

// Legacy type mappings (for easier migration)
export type FormattedPost = Post
