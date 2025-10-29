import { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'destination', 'status', 'startDate', 'endDate'],
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
      label: 'Trip Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'destination',
      type: 'text',
      required: true,
      label: 'Destination',
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'planning',
      required: true,
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Public Trip',
      defaultValue: false,
    },
    {
      name: 'itinerary',
      type: 'array',
      label: 'Itinerary',
      fields: [
        {
          name: 'day',
          type: 'number',
          required: true,
          label: 'Day',
        },
        {
          name: 'date',
          type: 'date',
          label: 'Date',
        },
        {
          name: 'destination',
          type: 'relationship',
          relationTo: 'destinations',
          label: 'Destination',
        },
        {
          name: 'time',
          type: 'text',
          label: 'Time',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Activity Title',
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notes',
        },
        {
          name: 'orderIndex',
          type: 'number',
          label: 'Order',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Auto-set user from request
        if (req.user && !data.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
