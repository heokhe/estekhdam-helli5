import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { prisma } from '~/db.server'
import { z } from 'zod'
import {
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  TextField,
  Stack,
  Breadcrumbs,
  Grid,
} from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/server-runtime'
import { unstable_createFileUploadHandler } from '@remix-run/node'
import { useEffect } from 'react'
import { ImagePicker } from '~/components/ImagePicker'

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
  if (!category) {
    throw new Response(undefined, { status: 404 })
  }
  if (!category.data) {
    throw redirect('/')
  }
  let temp = category
  const list = [category]
  do {
    temp = temp.parent
    if (temp) {
      list.push(temp)
    }
  } while (temp)
  return [category, list.reverse()]
}

export async function action({ request, params }) {
  const categoryId = parseInt(params.categoryId)
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      data: {
        include: {
          questions: true,
        },
      },
    },
  })
  if (!category) {
    throw new Response(undefined, { status: 404 })
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      filter: ({ contentType }) => contentType === 'application/pdf',
      directory: 'public/uploads',
      file: () => `cv-${Date.now()}.pdf`,
    }),
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      filter: ({ contentType }) => contentType.startsWith('image/'),
      directory: 'public/uploads',
      file: ({ filename }) => `${Date.now()}-${filename}`,
    }),
    // parse everything else into memory
    unstable_createMemoryUploadHandler()
  )
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)
  const name = formData.get('name')
  const lastName = formData.get('lastName')
  const email = formData.get('email')
  const phoneNumber = formData.get('phoneNumber')
  const cv = formData.get('cv')
  const image = formData.get('image')

  try {
    z.object({
      name: z.string().min(1, 'نام نباید خالی باشد'),
      lastName: z.string().min(1, 'نام خانوادگی نباید خالی باشد'),
      email: z
        .string()
        .email({ message: 'آدرس ایمیل معتبر نیست' })
        .or(z.string().max(0)),
      phoneNumber: z
        .string()
        .min(1, 'شماره تلفن اجباری است')
        .length(11, 'شماره تلفن باید ۱۱ رقم باشد')
        .regex(/^09\d{9}$/, 'شماره تلفن معتبر نیست'),
    }).parse({
      name,
      lastName,
      email,
      phoneNumber,
    })
  } catch (error) {
    throw json({ errors: error.issues }, { status: 400 })
  }
  if (!category.data.requiresCV && !cv.name) {
    throw json(
      { errors: [{ message: 'ارسال فایل رزومه الزامی است' }] },
      { status: 400 }
    )
  }
  if (!image.name) {
    throw json(
      { errors: [{ message: 'ارسال عکس پرسنلی الزامی است' }] },
      { status: 400 }
    )
  }

  const answerEntries = [...formData.entries('answer')].filter(([fieldName]) =>
    fieldName.startsWith('answer-')
  )

  const application = await prisma.application.create({
    data: {
      name,
      lastName,
      email,
      phoneNumber,
      category: {
        connect: {
          id: categoryId,
        },
      },
      ...(cv.name && {
        cvAddress: `/uploads/${cv.name}`,
      }),
      imageAddress: `/uploads/${image.name}`,
    },
  })

  for (const question of category.data.questions) {
    const [, answerValue] =
      answerEntries.find(
        ([fieldName]) => fieldName === `answer-${question.id}`
      ) ?? []
    if (!answerValue) {
      throw json(
        { errors: [{ message: `لطفاً به تمام سوالات پاسخ دهید` }] },
        { status: 400 }
      )
    }
    await prisma.answer.create({
      data: {
        value: answerValue,
        question: {
          connect: {
            id: question.id,
          },
        },
        Application: {
          connect: {
            id: application.id,
          },
        },
      },
    })
  }

  return redirect('/application/done')
}

export default function ApplicationForm() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const [category, list] = useLoaderData()
  const actionData = useActionData()
  useEffect(() => {
    if (actionData) {
      console.log(actionData)
    }
  }, [actionData])
  const { requiresCV } = category.data
  return (
    <>
      <Toolbar
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          maxWidth: 'sm',
          mx: 'auto',
        }}
      >
        <IconButton edge="start" component={Link} to="/" sx={{ mr: 2 }}>
          <ArrowForward />
        </IconButton>
        <Typography variant="h6">ثبت درخواست استخدام</Typography>
      </Toolbar>
      <Container maxWidth="xs">
        <Form method="post" encType="multipart/form-data">
          <Breadcrumbs sx={{ my: 4 }}>
            {list.map(l => (
              <span key={l.id} href="/">
                {l.title}
              </span>
            ))}
          </Breadcrumbs>
          <Stack gap={2}>
            <Typography variant="h5">مشخصات فردی</Typography>
            <Stack direction="row" gap={1}>
              <Grid container gap={2} flexWrap="nowrap" alignItems="center">
                <Grid item xs="auto" sx={{ textAlign: 'center' }}>
                  <ImagePicker required size={64} />
                  <Typography variant="caption" color="text.secondary">
                    عکس پرسنلی (حداکثر ۵ مگابایت)
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Stack gap={2}>
                    <TextField name="name" label="نام" variant="filled" />
                    <TextField
                      name="lastName"
                      label="نام خانوادگی"
                      variant="filled"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
            <TextField
              label="آدرس ایمیل"
              variant="filled"
              name="email"
              type="email"
            />
            <TextField
              label="شماره تماس"
              type="tel"
              pattern="^09\d{9}$"
              variant="filled"
              name="phoneNumber"
            />
          </Stack>
          <Stack gap={2} sx={{ mt: 4 }}>
            <Typography variant="h5">سوالات مربوط به حوزه کاری</Typography>
            {category.data.questions.map(question => (
              <TextField
                multiline
                minRows={3}
                key={question.id}
                label={question.title}
                variant="filled"
                name={`answer-${question.id}`}
              />
            ))}
          </Stack>
          <Stack gap={1} sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {!requiresCV
                ? 'در صورت تمایل می‌توانید فایل رزومه خود را نیز ارسال کنید.'
                : 'لطفا از بخش زیر فایل رزومه خود را نیز ضمیمه کنید.'}
            </Typography>
            <input type="file" name="cv" accept=".pdf" required={requiresCV} />
          </Stack>
          <Button
            sx={{ mx: 'auto', my: 3, display: 'flex' }}
            type="submit"
            variant="contained"
            disableElevation
            size="large"
            startIcon={<CheckCircleOutline />}
          >
            ثبت درخواست استخدام
          </Button>
        </Form>
      </Container>
    </>
  )
}
