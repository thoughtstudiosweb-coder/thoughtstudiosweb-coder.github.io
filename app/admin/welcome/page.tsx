import { readJSON } from '@/lib/content'
import WelcomeEditor from './WelcomeEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface WelcomeData {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
}

export default async function WelcomePage() {
  console.log('🔍 Welcome page: Fetching data from Postgres...')
  const welcome = await readJSON<WelcomeData>('welcome.json')
  console.log(`✅ Welcome page: Retrieved welcome data ${welcome ? '(exists)' : '(null)'}`)
  
  return <WelcomeEditor initialData={welcome} />
}
