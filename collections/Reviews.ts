import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['destination', 'user', 'rating', 'createdAt'],
    group: 'User Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        user: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        user: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
      label: 'Destination',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Review Title',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Review Content',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      label: 'Rating (1-5)',
    },
    {
      name: 'visitDate',
      type: 'date',
      label: 'Visit Date',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Photos',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'helpful',
      type: 'number',
      label: 'Helpful Count',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Pending', value: 'pending' },
        { label: 'Hidden', value: 'hidden' },
      ],
      defaultValue: 'published',
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
