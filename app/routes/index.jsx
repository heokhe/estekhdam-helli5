import { Link, useLoaderData } from '@remix-run/react'
import {
  Container,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { prisma } from '~/db.server'
import { useState } from 'react'
import logo from '~/public/logo.svg'
import { Logo } from '~/components/icons/Logo'
import { CategoryList } from '~/components/CategoryList'
import { getCategories } from '~/models/category.server'

export async function loader() {
  return await getCategories()
}

export default function Index() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const rootCategories = useLoaderData()
  return (
    <Container maxWidth={false} sx={{ textAlign: 'center', py: 5 }}>
      <img src={logo} alt="لوگوی دبیرستان علامه حلی پنج" width="10%" />
      <Typography variant="h3" sx={{ mb: 2, mt: 3, fontWeight: 500 }}>
        استخدام در دبیرستان علامه حلی پنج
      </Typography>
      <Typography variant="h5" color="text.secondary">
        برای ادامه، یکی از موقعیت‌های شغلی زیر را انتخاب کنید.
      </Typography>
      <Container maxWidth="xs" sx={{ mt: 5 }}>
        <Paper variant="outlined">
          <CategoryList
            maximumVisibleDepth={1}
            categories={rootCategories}
            renderFinalItem={category => (
              <ListItemButton
                component={Link}
                to={`application/${category.id}`}
                key={category.id}
              >
                <ListItemText primary={category.title} />
                <ArrowBack color="primary" />
              </ListItemButton>
            )}
          />
        </Paper>
      </Container>
    </Container>
  )
}
