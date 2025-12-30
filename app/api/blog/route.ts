import { NextResponse } from 'next/server'
import { readMarkdownFiles } from '@/lib/content'
import matter from 'gray-matter'

export async function GET() {
  const files = await readMarkdownFiles()
  const posts = files.map(({ slug, content }) => {
    const { data, content: body } = matter(content)
    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      tags: data.tags || [],
      cover: data.cover || '',
      excerpt: body.split('\n').slice(0, 3).join(' ').substring(0, 200),
    }
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return NextResponse.json(posts)
}

