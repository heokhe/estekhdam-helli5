import { CssBaseline } from '@mui/material'
import { json } from '@remix-run/node'
import { ThemeProvider } from '@mui/material/styles'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { CacheProvider } from '@emotion/react'
import { getUser } from './session.server'
import { cacheRtl, theme } from './theme'
import styles from './styles/index.css'

export const meta = () => ({
  charset: 'utf-8',
  title: 'استخدام در دبیرستان علامه حلی پنج',
  viewport: 'width=device-width,initial-scale=1',
})

export const links = () => [
  {
    rel: 'stylesheet',
    href: styles,
  },
]

export async function loader({ request }) {
  return json({
    user: await getUser(request),
  })
}

export default function App() {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <Outlet />
          </ThemeProvider>
        </CacheProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
