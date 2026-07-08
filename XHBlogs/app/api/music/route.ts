import { NextRequest, NextResponse } from 'next/server'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
}

const NET_EASE_HEADERS = {
  ...BROWSER_HEADERS,
  Referer: 'https://music.163.com/',
}

type SongResult = {
  id: string
  name?: string
  artist?: string
  author?: string
  cover?: string
  pic?: string
  url?: string
  lrc?: string
  lrcUrl?: string
  error?: string
}

function extractQqPlaylistId(input: string | null) {
  if (!input) return ''

  if (/^\d+$/.test(input)) return input

  try {
    const url = new URL(input)
    return (
      url.searchParams.get('id') ||
      url.searchParams.get('disstid') ||
      url.searchParams.get('dirid') ||
      ''
    )
  } catch {
    const match = input.match(/(?:id|disstid)=(\d+)/)
    return match?.[1] || ''
  }
}

async function resolveQqPlaylistId(playlistId: string, playlistUrl: string | null) {
  if (playlistId) return playlistId
  if (!playlistUrl) return ''

  let currentUrl = playlistUrl
  for (let i = 0; i < 4; i += 1) {
    const directId = extractQqPlaylistId(currentUrl)
    if (directId) return directId

    const res = await fetch(currentUrl, {
      headers: BROWSER_HEADERS,
      redirect: 'manual',
      signal: AbortSignal.timeout(6000),
    })

    const location = res.headers.get('location')
    if (!location) break
    currentUrl = new URL(location, currentUrl).toString()
  }

  return extractQqPlaylistId(currentUrl)
}

async function getQqPlaylistSongs(playlistId: string): Promise<SongResult[]> {
  const apiUrl = `https://api.injahow.cn/meting/?server=tencent&type=playlist&id=${playlistId}`
  const res = await fetch(apiUrl, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`QQ playlist request failed: ${res.status}`)
  }

  const songs = await res.json()
  if (!Array.isArray(songs)) {
    throw new Error('QQ playlist response is not an array')
  }

  return songs
    .map((song: any, index: number): SongResult => ({
      id: song.id || song.mid || song.songmid || `${playlistId}-${index}`,
      name: song.name || song.title || '未知歌曲',
      artist: song.artist || song.author || '未知歌手',
      author: song.artist || song.author || '未知歌手',
      cover: song.pic || song.cover || '',
      pic: song.pic || song.cover || '',
      url: song.url || '',
      lrcUrl: typeof song.lrc === 'string' && song.lrc.startsWith('http') ? song.lrc : '',
      lrc: typeof song.lrc === 'string' && !song.lrc.startsWith('http') ? song.lrc : '',
    }))
    .filter((song) => Boolean(song.url))
}

async function getNeteaseSongs(ids: string): Promise<SongResult[]> {
  const songIds = ids.split(',').map((id) => id.trim()).filter(Boolean)

  return Promise.all(
    songIds.map(async (songId): Promise<SongResult> => {
      try {
        const [detailRes, lrcRes] = await Promise.all([
          fetch(
            `https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`,
            { headers: NET_EASE_HEADERS, signal: AbortSignal.timeout(6000) },
          ),
          fetch(
            `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`,
            { headers: NET_EASE_HEADERS, signal: AbortSignal.timeout(6000) },
          ).catch(() => null),
        ])

        const detail = await detailRes.json()
        const song = detail.songs?.[0]

        if (!song) {
          return { id: songId, error: 'not_found' }
        }

        let lrcText = ''
        if (lrcRes && lrcRes.ok) {
          try {
            const lrcData = await lrcRes.json()
            lrcText = lrcData.lrc?.lyric || ''
          } catch {
            /* 歌词可选，失败不影响主流程 */
          }
        }

        const artistName = song.artists?.[0]?.name || '未知歌手'

        return {
          id: songId,
          name: song.name,
          artist: artistName,
          author: artistName,
          cover: song.album?.picUrl || '',
          pic: song.album?.picUrl || '',
          url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
          lrc: lrcText,
        }
      } catch (error) {
        console.error(`[api/music] 获取网易云歌曲 ${songId} 失败:`, error)
        return { id: songId, error: String(error) }
      }
    }),
  )
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider')

  try {
    if (provider === 'qq') {
      const playlistId = await resolveQqPlaylistId(
        request.nextUrl.searchParams.get('playlistId') || '',
        request.nextUrl.searchParams.get('playlistUrl'),
      )

      if (!playlistId) {
        return NextResponse.json({ error: 'Missing QQ playlist id' }, { status: 400 })
      }

      const songs = await getQqPlaylistSongs(playlistId)
      return NextResponse.json(songs)
    }

    const ids = request.nextUrl.searchParams.get('ids')
    if (!ids) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
    }

    const songs = await getNeteaseSongs(ids)
    return NextResponse.json(songs)
  } catch (error) {
    console.error('[api/music] 获取音乐失败:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
