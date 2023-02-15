import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import OpenInNew from '@mui/icons-material/OpenInNew'
import { Container, Link as MuiLink, styled, Typography } from '@mui/material'

const LinkIcon = styled(OpenInNew)(() => ({
  verticalAlign: 'middle',
  marginLeft: '0.1em',
  transform: 'scaleX(-1)',
  fontSize: 'inherit',
}))

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
        در صورت تایید اولیه، همکاران ما با شما جهت مصاحبه حضوری تماس خواهند
        گرفت.
      </Typography>
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <MuiLink href="https://allamehelli5.ir" target="_blank">
          وبسایت دبیرستان علامه حلی پنج
          <LinkIcon />
        </MuiLink>
        <br />
        <MuiLink href="https://allamehelli5.ir" target="_blank">
          وبسایت دبیرستان علامه حلی پنج
          <LinkIcon />
        </MuiLink>
      </Container>
    </Container>
  )
}
