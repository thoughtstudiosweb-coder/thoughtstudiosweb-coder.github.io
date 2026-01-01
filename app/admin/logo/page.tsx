import { getLogo } from './actions'
import LogoEditor from './LogoEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LogoPage() {
  console.log('🔍 Logo page: Fetching data from Postgres...')
  const logo = await getLogo()
  console.log(`✅ Logo page: Retrieved logo data ${logo ? '(exists)' : '(null)'}`)
  
  return <LogoEditor initialData={logo} />
}

