import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
    }),
    defineField({
      name: 'designer',
      title: 'Designer',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{ type: 'city' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subline',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'michelinStars',
      title: 'Michelin Stars',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(3),
    }),
    defineField({
      name: 'crown',
      title: 'Featured (Crown)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
        },
        {
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
        },
        {
          name: 'address',
          title: 'Address',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'cardTags',
      title: 'Card Tags',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city.name',
      media: 'mainImage',
    },
  },
})

