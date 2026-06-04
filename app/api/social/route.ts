import { NextRequest, NextResponse } from 'next/server'
import { getSocialPosts, createSocialPost, deleteSocialPost } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') || undefined
  const posts = await getSocialPosts(platform)
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const post = await createSocialPost(data)
  return NextResponse.json(post, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await deleteSocialPost(id)
  return NextResponse.json({ ok: true })
}
