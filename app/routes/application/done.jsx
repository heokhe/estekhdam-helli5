import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import OpenInNew from '@mui/icons-material/OpenInNew'
import {
  Container,
  Divider,
  Link as MuiLink,
  styled,
  Typography,
} from '@mui/material'

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
        <Divider sx={{ mb: 3, maxWidth: 300, mx: 'auto' }} />
        <Typography paragraph color="text.secondary">
          برای آشنایی بیش‌تر ما با شما، حتماً تا قبل مصاحبه حضوری تست‌های زیر را
          تکمیل کنید. این فرآیند نهایتاً نیم ساعت زمان خواهد برد.
        </Typography>
        <MuiLink
          href="https://docs.google.com/forms/d/e/1FAIpQLSccvI38448uwrz6-eXYEHkipf8tZfBEvxlHSxqyib6QWZ48VQ/viewform?usp=sf_link"
          target="_blank"
        >
          تست رغبت‌سنجی شغلی (هالند)
          <LinkIcon />
        </MuiLink>
        <br />
        <MuiLink
          href="https://docs.google.com/forms/d/1W53tuJcETWhn59Wxus_B9rwAlPDvdbVuuUrFB58Haw0"
          target="_blank"
        >
          فرم شخصیت سه‌بعدی
          <LinkIcon />
        </MuiLink>
        <br />
        <MuiLink
          href="https://docs.google.com/forms/d/1F67k9VKgk52Fgp3trk-r4nou_FnocoW-6PgySjxSD4g"
          target="_blank"
        >
          فرم شخصیت پنج‌بعدی
          <LinkIcon />
        </MuiLink>
      </Container>
    </Container>
  )
}
