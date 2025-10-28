import { CollectionConfig } from 'payload'

export const Lists: CollectionConfig = {
  slug: 'lists',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'isPublic', 'createdAt'],
    group: 'User Content',
  },
  access: {
    read: () => true, // Simplified - implement RLS in frontend
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'List Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      label: 'Destinations',
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Public List',
      defaultValue: false,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
    {
      name: 'likes',
      type: 'number',
      label: 'Likes',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
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
