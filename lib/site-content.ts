import { cache } from 'react'
import { readJSON } from './content'

export interface SiteContent {
  navigation: {
    believe: string
    explore: string
    studioNotes: string
    development: string
  }
  sections: {
    believe: {
      title: string
    }
    explore: {
      title: string
    }
    studioNotes: {
      title: string
    }
    development: {
      title: string
      intro: string
      outro: string
    }
  }
  footer: {
    tagline: string
    copyright: string
  }
}

// Default values - used as fallback if CMS data is missing
const DEFAULT_SITE_CONTENT: SiteContent = {
  navigation: {
    believe: 'What We Believe',
    explore: 'What We Explore',
    studioNotes: 'Studio Notes',
    development: 'In Development',
  },
  sections: {
    believe: {
      title: 'What We Believe',
    },
    explore: {
      title: 'What We Explore',
    },
    studioNotes: {
      title: 'Studio Notes',
    },
    development: {
      title: 'In Development',
      intro: 'Thought Studios is being built with intention, not rushed. We\'re shaping the philosophy, approach, and future offerings. One-on-one sessions and workshops are possibilities we\'re considering.',
      outro: 'Curious? Follow our Studio notes and Instagram to explore on your own while we build.',
    },
  },
  footer: {
    tagline: 'A place to think clearly',
    copyright: '© 2025 RB & A Consulting LLC. Thought Studios™ is a brand of RB & A Consulting LLC. All rights reserved.',
  },
}

/**
 * Fetches site-wide content (navigation labels, section headers, footer content).
 * Uses React cache() to deduplicate requests within the same render cycle.
 * 
 * Returns default values if CMS data is not available.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const content = await readJSON<SiteContent>('site-content.json')
  
  if (!content) {
    console.log('⚠️ site-content.json not found, using defaults')
    return DEFAULT_SITE_CONTENT
  }
  
  // Merge with defaults to ensure all fields are present
  return {
    navigation: {
      ...DEFAULT_SITE_CONTENT.navigation,
      ...content.navigation,
    },
    sections: {
      ...DEFAULT_SITE_CONTENT.sections,
      ...content.sections,
    },
    footer: {
      ...DEFAULT_SITE_CONTENT.footer,
      ...content.footer,
    },
  }
})

