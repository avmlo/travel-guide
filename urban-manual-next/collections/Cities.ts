import { CollectionConfig } from 'payload'

export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'destinationCount'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'City Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      label: 'Country',
    },
    {
      name: 'coordinates',
      type: 'group',
      label: 'Coordinates',
      fields: [
        {
          name: 'lat',
          type: 'number',
          label: 'Latitude',
        },
        {
          name: 'long',
          type: 'number',
          label: 'Longitude',
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'City Image',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
    },
    {
      name: 'priority',
      type: 'number',
      label: 'Display Priority',
      defaultValue: 0,
      admin: {
        description: 'Higher priority cities appear first',
      },
    },
    {
      name: 'destinationCount',
      type: 'number',
      label: 'Destination Count',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Auto-calculated number of destinations',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
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
