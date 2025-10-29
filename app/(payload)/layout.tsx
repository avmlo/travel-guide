/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { serverFunction } from './serverFunction'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={{}} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout

export const metadata: Metadata = {
  title: 'Urban Manual Admin',
  description: 'Urban Manual CMS Admin Panel',
}
