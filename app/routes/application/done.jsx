import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import OpenInNew from '@mui/icons-material/OpenInNew'
import { Container, Link as MuiLink, Typography } from '@mui/material'

export default function ApplicationDone() {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', pt: 10, pb: 5 }}>
      <HandshakeOutlined color="primary" sx={{ fontSize: '10vw' }} />
      <Typography variant="h3" sx={{ mb: 2, mt: 3, fontWeight: 500 }}>
        از همکاری شما صمیمانه متشکریم!
      </Typography>
      <Typography variant="h5" color="text.secondary">
        درخواست استخدام شما ثبت شد.
        <br />
        همکاران ما پس از بررسی با شما تماس خواهند گرفت.
      </Typography>
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <MuiLink href="https://allamehelli5.ir" target="_blank">
          وبسایت دبیرستان علامه حلی پنج
          <OpenInNew
            sx={{
              verticalAlign: 'middle',
              ml: '0.1em',
              transform: 'scaleX(-1)',
            }}
            fontSize="inherit"
          />
        </MuiLink>
      </Container>
    </Container>
  )
}
