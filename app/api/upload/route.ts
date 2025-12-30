import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !(session as any).loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // On Vercel, require Blob Storage (filesystem is read-only)
    if (process.env.VERCEL) {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        return NextResponse.json(
          { 
            error: 'Vercel Blob Storage is required for file uploads on Vercel.',
            hint: 'Go to Vercel Dashboard → Your Project → Storage → Create Database → Select "Blob". This will automatically add BLOB_READ_WRITE_TOKEN to your environment variables.'
          },
          { status: 500 }
        )
      }

      try {
        const { put } = await import('@vercel/blob')
        
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `uploads/${timestamp}_${sanitizedName}`
        
        const blob = await put(filename, file, {
          access: 'public',
          token: blobToken,
          contentType: file.type,
        })

        console.log(`✅ Image uploaded to Blob Storage: ${blob.url}`)
        return NextResponse.json({ 
          url: blob.url, 
          filename: filename,
          source: 'blob' 
        })
      } catch (blobError: any) {
        console.error('❌ Blob storage error:', blobError)
        const errorMsg = blobError?.message || String(blobError)
        return NextResponse.json(
          { 
            error: `Failed to upload to Blob Storage: ${errorMsg}`,
            hint: 'Check that BLOB_READ_WRITE_TOKEN is correct in your environment variables.'
          },
          { status: 500 }
        )
      }
    }

    // Local development: Try Blob Storage first (if available), then fallback to filesystem
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (blobToken) {
      try {
        const { put } = await import('@vercel/blob')
        
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `uploads/${timestamp}_${sanitizedName}`
        
        const blob = await put(filename, file, {
          access: 'public',
          token: blobToken,
          contentType: file.type,
        })

        return NextResponse.json({ 
          url: blob.url, 
          filename: filename,
          source: 'blob' 
        })
      } catch (blobError) {
        console.warn('Blob storage not available, falling back to filesystem:', blobError)
        // Fall through to filesystem fallback
      }
    }

    // Filesystem fallback (local development only)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ 
      url, 
      filename,
      source: 'filesystem' 
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    const errorMsg = error?.message || String(error)
    return NextResponse.json(
      { 
        error: `Failed to upload file: ${errorMsg}`,
        hint: process.env.VERCEL 
          ? 'Ensure Vercel Blob Storage is set up and BLOB_READ_WRITE_TOKEN is configured.'
          : 'Check file permissions and disk space.'
      },
      { status: 500 }
    )
  }
}

