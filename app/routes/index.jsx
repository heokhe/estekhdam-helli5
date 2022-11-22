import { Link, useLoaderData } from '@remix-run/react';
import {
  Container,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Collapse,
  Box,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { prisma } from '~/db.server';
import { useState } from 'react';
import logo from '~/public/logo.svg';
import { Logo } from '~/components/icons/Logo';

export async function loader() {
  return await prisma.category.findMany({
    include: {
      subcategories: {
        include: {
          subcategories: true,
        },
      },
      parent: true,
      applications: false,
    },
    where: { parent: null },
  });
}

function ListItemWithNestedList({
  list,
  children,
  initiallyOpen = false,
  ...props
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <ListItemButton {...props} onClick={() => setOpen(!open)}>
        {children}
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>{list}</Collapse>
    </>
  );
}

function CategoryList({ categories, depth = 0, ...props }) {
  return (
    <List disablePadding {...props}>
      {categories.map((category) =>
        category.subcategories ? (
          <ListItemWithNestedList
            initiallyOpen={depth === 0}
            key={category.id}
            list={
              <CategoryList
                depth={depth + 1}
                key={`${category.id}children`}
                categories={category.subcategories}
                sx={{ ml: 2, borderLeft: 1, borderColor: 'divider' }}
              />
            }
          >
            <ListItemText primary={category.title} />
          </ListItemWithNestedList>
        ) : (
          <ListItemButton
            component={Link}
            to={`application/${category.id}`}
            key={category.id}
          >
            <ListItemText primary={category.title} />
            <ArrowBack color="primary" />
          </ListItemButton>
        ),
      )}
    </List>
  );
}

export default function Index() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const rootCategories = useLoaderData();
  return (
    <Container maxWidth={false} sx={{ textAlign: 'center', py: 5 }}>
      <img src={logo} alt="لوگوی دبیرستان علامه حلی پنج" width="10%" />
      <Typography variant="h3" sx={{ my: 2 }}>
        استخدام در دبیرستان علامه حلی پنج
      </Typography>
      <Typography variant="h5" color="text.secondary">
        برای ادامه، یکی از موقعیت‌های شغلی زیر را انتخاب کنید.
      </Typography>
      <Container maxWidth="xs" sx={{ mt: 5 }}>
        <Paper variant="outlined">
          <CategoryList categories={rootCategories} />
        </Paper>
      </Container>
    </Container>
  );
}
