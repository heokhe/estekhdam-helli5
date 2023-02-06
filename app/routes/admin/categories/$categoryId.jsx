import {
  Checkbox,
  Divider,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { useRef } from 'react'
import { prisma } from '~/db.server'

export async function loader({ params }) {
  const categoryId = parseInt(params.categoryId)
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: { include: { parent: true } },
      applications: false,
      data: {
        include: {
          questions: true,
        },
      },
    },
  })
  if (!category) return redirect('/admin/categories')
  return category
}

export async function action({ request }) {
  const formData = await request.formData()
  console.log(Object.fromEntries(formData.entries()))
  const action = formData.get('action')
  if (action === 'new-question') {
    const categoryId = parseInt(formData.get('category'))
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { data: true },
    })
    const questionTitle = formData.get('question')
    const question = await prisma.question.create({
      data: {
        title: questionTitle,
        categoryDataId: category.data.id,
      },
    })
    return json(question)
  }
  if (action === 'toggle-requires-cv') {
    const categoryId = parseInt(formData.get('category'))
    const requires = formData.get('requires-cv') === 'true'
    await prisma.categoryData.updateMany({
      where: {
        Category: {
          every: {
            id: categoryId,
          },
        },
      },
      data: {
        requiresCV: requires,
      },
    })
    return json({})
  }
}

export default function EditCategory() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const selectedCategory = useLoaderData()
  const fetcher = useFetcher()
  const ref = useRef()

  return (
    <Box sx={{ pb: 1, minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mx: 2, my: 3 }}>
        ویرایش سوالات «{selectedCategory.title}»
      </Typography>
      <List disablePadding>
        <ListItem key={`category-${selectedCategory.id}`}>
          <ListItemIcon>
            <Checkbox
              defaultChecked={selectedCategory.data.requiresCV}
              onChange={event => {
                const formData = new FormData()
                formData.set('action', 'toggle-requires-cv')
                formData.set('category', selectedCategory.id)
                formData.set('requires-cv', event.target.checked)
                fetcher.submit(formData, {
                  replace: false,
                  method: 'post',
                })
              }}
            />
          </ListItemIcon>
          <ListItemText primary="ارسال رزومه اجباری باشد" />
        </ListItem>
        <Divider variant="inset" />
        {selectedCategory.data?.questions.map(question => (
          <ListItem key={question.id}>
            <ListItemText primary={question.title} />
          </ListItem>
        ))}
        <form
          onSubmit={event => {
            event.preventDefault()
            const formData = new FormData()
            formData.set('action', 'new-question')
            formData.set('category', selectedCategory.id)
            formData.set('question', ref.current.value)
            fetcher.submit(formData, {
              replace: false,
              method: 'post',
            })
            ref.current.value = ''
          }}
        >
          <ListItem>
            <InputBase
              inputRef={ref}
              fullWidth
              autoComplete="off"
              required
              placeholder="سوال جدید..."
            />
          </ListItem>
        </form>
      </List>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mx: 2, mt: 1 }}
      >
        {selectedCategory.data?.questions.length ?? 0} سوال
      </Typography>
    </Box>
  )
}
