import { PortableText as PortableTextReact, PortableTextReactComponents } from '@portabletext/react'
import { urlFor } from '~/sanity/lib/image'
import type { PortableTextContent } from '~/types'

interface PortableTextProps {
	content: PortableTextContent
	components: Partial<PortableTextReactComponents>
	className?: string
}

const defaultComponents = {
	types: {
		image: ({ value }: any) => {
			return (
				<figure className="my-8">
					<img
						src={urlFor(value.asset).width(800).url()}
						alt={value.alt || ''}
						className="w-full rounded-lg"
					/>
					{value.caption && (
						<figcaption className="text-center text-sm text-muted-foreground mt-2">
							{value.caption}
						</figcaption>
					)}
				</figure>
			)
		}
	},
	marks: {
		code: ({ children }: any) => (
			<code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
		)
	}
}

export default function PortableText({ content, className = '', components }: PortableTextProps) {
	return (
		<div className={`prose prose-lg max-w-none ${className}`}>
			<PortableTextReact
				value={content}
				components={components || defaultComponents}
			/>
		</div>
	)
}
