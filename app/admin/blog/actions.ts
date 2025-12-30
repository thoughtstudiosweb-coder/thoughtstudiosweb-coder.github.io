'use server'

import { deleteBlogPost, createBlogPost, updateBlogPost, getBlogPost, type BlogPost } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function deletePost(slug: string) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    throw new Error('Unauthorized')
  }

  const success = await deleteBlogPost(slug)
  
  if (success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/blog')
    revalidatePath('/')
    revalidatePath('/studio-notes')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to delete post')
}

export async function createPost(post: {
  slug: string
  title: string
  date: string
  tags: string[]
  cover: string
  content: string
}) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    throw new Error('Unauthorized')
  }

  const blogPost: BlogPost = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    cover: post.cover || '',
    content: post.content,
  }

  const result = await createBlogPost(blogPost)
  
  if (result.success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/blog')
    revalidatePath('/')
    revalidatePath('/studio-notes')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/development')
    return { success: true, slug: post.slug }
  }
  
  throw new Error(result.error || 'Failed to create post')
}

export async function updatePost(slug: string, post: {
  title: string
  date: string
  tags: string[]
  cover: string
  content: string
}) {
  const session = await getSession()
  if (!session || !session.loggedIn) {
    throw new Error('Unauthorized')
  }

  const blogPost: BlogPost = {
    slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    cover: post.cover || '',
    content: post.content,
  }

  const success = await updateBlogPost(slug, blogPost)
  
  if (success) {
    // Revalidate both CMS and website pages
    revalidatePath('/admin/blog')
    revalidatePath(`/admin/blog/edit/${slug}`)
    revalidatePath('/')
    revalidatePath('/studio-notes')
    revalidatePath('/explore')
    revalidatePath('/believe')
    revalidatePath('/development')
    return { success: true }
  }
  
  throw new Error('Failed to update post')
}

export async function getPost(slug: string) {
  const post = await getBlogPost(slug)
  if (!post) {
    return null
  }
  
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: Array.isArray(post.tags) ? post.tags : [],
    cover: post.cover || '',
    content: post.content || '',
  }
}

