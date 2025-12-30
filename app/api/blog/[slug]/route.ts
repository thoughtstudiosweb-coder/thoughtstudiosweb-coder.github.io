import { NextRequest, NextResponse } from 'next/server'
import { readMarkdownFile } from '@/lib/content'
import matter from 'gray-matter'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug
  const content = await readMarkdownFile(slug)
  
  if (!content) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }
  
  const { data, content: body } = matter(content)
  return NextResponse.json({
    slug,
    title: data.title || '',
    date: data.date || '',
    tags: data.tags || [],
    cover: data.cover || '',
    content: body,
  })
}

