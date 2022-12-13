import path from 'path';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { prisma } from '~/db.server';
import { z } from 'zod';
import {
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  TextField,
  Stack,
  Breadcrumbs,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/server-runtime';
import { unstable_createFileUploadHandler } from '@remix-run/node';
import { useEffect } from 'react';

export async function loader({ params }) {
  const categoryId = parseInt(params.categoryId);
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
  });
  if (!category) {
    throw new Response(undefined, { status: 404 });
  }
  if (!category.data) {
    throw redirect('/');
  }
  let temp = category;
  const list = [category];
  do {
    temp = temp.parent;
    if (temp) {
      list.push(temp);
    }
  } while (temp);
  return [category, list.reverse()];
}

export async function action({ request, params }) {
  // const origin = request.headers.get("origin");
  const categoryId = parseInt(params.categoryId);
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      data: {
        include: {
          questions: true,
        },
      },
    },
  });
  if (!category) {
    throw new Response(undefined, { status: 404 });
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      filter: ({ contentType }) => contentType === 'application/pdf',
      directory: 'public/cvs',
      file: () => `cv-${Date.now()}.pdf`,
    }),
    // parse everything else into memory
    unstable_createMemoryUploadHandler(),
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );
  const name = formData.get('name');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const phoneNumber = formData.get('phoneNumber');
  const cv = formData.get('cv');

  try {
    z.object({
      name: z.string().min(1, 'نام نباید خالی باشد'),
      lastName: z.string().min(1, 'نام خانوادگی نباید خالی باشد'),
      email: z
        .string()
        .email({ message: 'آدرس ایمیل معتبر نیست' })
        .or(z.string().max(0)),
      phoneNumber: z.string(), // TODO
    }).parse({
      name,
      lastName,
      email,
      phoneNumber,
    });
  } catch (error) {
    throw json({ errors: error.issues }, { status: 400 });
  }
  if (!category.data.requiresCV && !cv.name) {
    throw json(
      { errors: [{ message: 'ارسال فایل رزومه الزامی است' }] },
      { status: 400 },
    );
  }
  // const cvRelativePath = path.relative(
  //   path.resolve(__dirname, ".."),
  //   cv.filepath
  // );

  const answerEntries = [...formData.entries('answer')].filter(([fieldName]) =>
    fieldName.startsWith('answer-'),
  );

  const application = await prisma.application.create({
    data: {
      name,
      lastName,
      email,
      phoneNumber,
      categoryId: category.id,
    },
  });

  for (const question of category.data.questions) {
    const [, answerValue] =
      answerEntries.find(
        ([fieldName]) => fieldName === `answer-${question.id}`,
      ) ?? [];
    if (!answerValue) {
      throw json(
        { errors: [{ message: `لطفاً به تمام سوالات پاسخ دهید` }] },
        { status: 400 },
      );
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
    });
  }

  return redirect('/application/done');
}

export default function ApplicationForm() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const [category, list] = useLoaderData();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData) {
      console.log(actionData);
    }
  }, [actionData]);
  const { requiresCv } = category.data;
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
            {list.map((l) => (
              <span key={l.id} href="/">
                {l.title}
              </span>
            ))}
          </Breadcrumbs>
          <Stack gap={2}>
            <Typography variant="h5">مشخصات فردی</Typography>
            <Stack direction="row" gap={1}>
              <TextField name="name" label="نام" variant="filled" />
              <TextField
                name="lastName"
                label="نام خانوادگی"
                variant="filled"
              />
            </Stack>
            <TextField
              label="آدرس ایمیل"
              variant="filled"
              name="email"
              type="email"
            />
            <TextField
              label="شماره تماس"
              variant="filled"
              name="phoneNumber"
              type="email"
            />
          </Stack>
          <Stack gap={2} sx={{ mt: 4 }}>
            <Typography variant="h5">سوالات مربوط به حوزه کاری</Typography>
            {category.data.questions.map((question) => (
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
              {!requiresCv
                ? 'در صورت تمایل می‌توانید فایل رزومه خود را نیز ارسال کنید.'
                : 'لطفا از بخش زیر فایل رزومه خود را نیز ضمیمه کنید.'}
            </Typography>
            <input type="file" name="cv" accept=".pdf" required={requiresCv} />
          </Stack>
          <Button
            sx={{ mx: 'auto', mt: 3, display: 'flex' }}
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
  );
}
