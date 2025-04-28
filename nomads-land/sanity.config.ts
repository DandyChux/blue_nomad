import { defineConfig } from 'sanity'
import { structureTool, type StructureResolver } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export const structure: StructureResolver = (S) =>
	S.list()
		.title('Blog')
		.items([
			S.documentTypeListItem('post').title('Posts'),
			S.documentTypeListItem('category').title('Categories'),
			S.documentTypeListItem('author').title('Authors'),
			S.divider(),
			...S.documentTypeListItems().filter(
				(item) => item.getId() && !['post', 'category', 'author'].includes(item.getId()!),
			),
		])


export default defineConfig({
	name: 'default',
	title: 'Nomad\'s Land',

	projectId: '0m0fd5c4',
	dataset: 'production',

	plugins: [structureTool({ structure }), visionTool()],

	schema: {
		types: schemaTypes,
	},
})
