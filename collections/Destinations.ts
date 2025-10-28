import { CollectionConfig } from 'payload'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'category', 'michelinStars', 'crown', 'status'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Destination Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'URL-friendly version of the name',
      },
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Brand/Business Name',
    },
    {
      name: 'designer',
      type: 'text',
      label: 'Designer/Architect',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Category',
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities',
      required: true,
      label: 'City',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Description',
      required: true,
    },
    {
      name: 'subline',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: 'Brief description shown on cards',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Main Image',
    },
    {
      name: 'additionalImages',
      type: 'array',
      label: 'Additional Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'michelinStars',
      type: 'number',
      label: 'Michelin Stars',
      defaultValue: 0,
      min: 0,
      max: 3,
    },
    {
      name: 'crown',
      type: 'checkbox',
      label: 'Featured (Crown)',
      defaultValue: false,
      admin: {
        description: 'Mark as curated/featured destination',
      },
    },
    {
      name: 'location',
      type: 'group',
      label: 'Location Details',
      fields: [
        {
          name: 'lat',
          type: 'number',
          label: 'Latitude',
          required: true,
        },
        {
          name: 'long',
          type: 'number',
          label: 'Longitude',
          required: true,
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Address',
        },
      ],
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'cardTags',
      type: 'text',
      label: 'Card Tags',
      admin: {
        description: 'Tags shown on destination cards',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'published',
      required: true,
    },
    {
      name: 'metrics',
      type: 'group',
      label: 'Metrics',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'saves',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'visits',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'averageRating',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from name if not provided
        if (data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  timestamps: true,
}
