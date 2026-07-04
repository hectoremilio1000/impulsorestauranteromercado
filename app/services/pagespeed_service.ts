import axios from 'axios'
import env from '#start/env'

const PAGESPEED_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export type PageSpeedResult = {
  mobilePerformanceScore: number | null
}

export async function getMobilePageSpeed(url: string): Promise<PageSpeedResult> {
  const { data } = await axios.get(PAGESPEED_URL, {
    timeout: 25000,
    params: {
      url,
      strategy: 'mobile',
      category: 'performance',
      key: env.get('GOOGLE_PLACES_API_KEY'),
    },
  })

  const rawScore = data?.lighthouseResult?.categories?.performance?.score

  return {
    mobilePerformanceScore: typeof rawScore === 'number' ? Math.round(rawScore * 100) : null,
  }
}
