import { readJSON } from '@/lib/content'
import { normalizeToHttps } from '@/lib/url-utils'
import Link from 'next/link'

interface LogoConfig {
  type: 'text' | 'image'
  text?: string
  fontSize?: number
  imageUrl?: string
  width?: number
  height?: number
}

interface LogoServerProps {
  className?: string
  showLink?: boolean
}

const DEFAULT_LOGO: LogoConfig = {
  type: 'text',
  text: 'Thought Studios™',
  fontSize: 24,
}

/**
 * Server Component for Logo - fetches directly from database
 * No API routes, no connection pooling delays, no client-side fetching
 */
export default async function LogoServer({ className, showLink = true }: LogoServerProps = { showLink: true }) {
  // Fetch logo directly from database (server-side)
  const logo = await readJSON<LogoConfig>('logo.json')
  const config = logo || DEFAULT_LOGO

  const logoContent = config.type === 'text' ? (
    <span
      style={{
        fontSize: `${config.fontSize || 24}px`,
      }}
    >
      {config.text || 'Thought Studios™'}
    </span>
  ) : (
    config.imageUrl && (
      <img
        src={normalizeToHttps(config.imageUrl)}
        alt="Logo"
        style={{
          width: `${config.width || 200}px`,
          height: `${config.height || 50}px`,
          objectFit: 'contain',
        }}
      />
    )
  )

  return showLink ? (
    <Link href="/" className={className || 'logo'}>
      {logoContent}
    </Link>
  ) : (
    <div className={className || 'logo'}>
      {logoContent}
    </div>
  )
}

