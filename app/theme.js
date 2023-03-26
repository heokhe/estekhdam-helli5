import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import rtlPlugin from 'stylis-plugin-rtl'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import { faIR as dataGridFaIR } from '@mui/x-data-grid'
import { faIR } from '@mui/material/locale'

export const theme = responsiveFontSizes(
  createTheme(
    {
      direction: 'rtl',
      typography: {
        fontFamily: 'Estedad',
      },
      palette: {
        background: {
          // default: "#fafafa",
        },
      },
    },
    faIR,
    dataGridFaIR
  )
)

export const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})
