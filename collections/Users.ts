import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
    tokenExpiration: 31536000, // 1 year in seconds
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      // Users can update their own profile
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete users
      if (user && user.role === 'admin') {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      unique: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'savedPlaces',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      label: 'Saved Places',
    },
    {
      name: 'visitedPlaces',
      type: 'array',
      label: 'Visited Places',
      fields: [
        {
          name: 'destination',
          type: 'relationship',
          relationTo: 'destinations',
          required: true,
        },
        {
          name: 'visitedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      label: 'User Preferences',
      fields: [
        {
          name: 'favoriteCategories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
        },
        {
          name: 'favoriteCities',
          type: 'relationship',
          relationTo: 'cities',
          hasMany: true,
        },
        {
          name: 'interests',
          type: 'array',
          fields: [
            {
              name: 'interest',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      label: 'User Statistics',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'level',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'citiesVisited',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'countriesVisited',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'placesVisited',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ],
  timestamps: true,
}
