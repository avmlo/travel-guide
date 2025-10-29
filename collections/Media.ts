import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
    group: 'Media',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
      },
      {
        name: 'card',
        width: 768,
        height: 768,
      },
      {
        name: 'tablet',
        width: 1024,
      },
      {
        name: 'desktop',
        width: 1920,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photo Credit',
    },
  ],
}
