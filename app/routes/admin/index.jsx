import {
  Form,
  useLoaderData,
  Link,
} from '@remix-run/react';
import { prisma } from '~/db.server';
import { DataGrid } from '@mui/x-data-grid';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Toolbar,
} from '@mui/material';
import { useState } from 'react';

export async function loader() {
  const rawApplications = await prisma.application.findMany({
    include: {
      answers: true,
      category: {
        include: {
          data: {
            include: {
              questions: true,
            },
          },
        },
      },
    },
  });
  const applications = rawApplications.map((application) => {
    return {
      ...application,
      answers: application.answers.map((answer) => {
        const question = application.category.data.questions.find(
          (q) => q.id === answer.questionId,
        );
        return {
          id: question.id,
          question: question.title,
          answer: answer.value,
        };
      }),
    };
  });
  return applications;
}

export default function Applications() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const applications = useLoaderData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  return (
    <>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>پنل ادمین</Typography>
      <Button component={Link} to="categories">ویرایش دسته‌بندی‌ها</Button>
      <Form action="logout" method="post">
        <Button type="submit">خروج</Button>
      </Form>
    </Toolbar>
    <div style={{ height: 600 }}>
      <DataGrid
        checkboxSelection
        disableSelectionOnClick
        columns={[
          {
            headerName: 'موقعیت شغلی',
            valueGetter: ({ row }) => {
              return row.category.title;
            },
            width: 200,
          },
          {
            field: 'name',
            headerName: 'نام',
            width: 120,
          },
          {
            field: 'lastName',
            headerName: 'نام خانوادگی',
            width: 170,
          },
          {
            field: 'phoneNumber',
            headerName: 'شماره تماس',
            width: 170,
          },
          {
            field: 'email',
            headerName: 'آدرس ایمیل',
            width: 170,
          },
          {
            field: 'time',
            type: 'dateTime',
            headerName: 'زمان ارسال',
            width: 200,
          },
          {
            field: 'اعمال',
            type: 'actions',
            getActions: ({ row }) => {
              return [
                <Button
                  key="answers"
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    setDialogOpen(true);
                    setCurrentApplication(row);
                  }}
                >
                  مشاهده پاسخ‌ها
                </Button>,
                row.cvAddress && (
                  <Button
                    key="cv"
                    href={row.cvAddress}
                    target="_blank"
                    variant="contained"
                    disableElevation
                  >
                    مشاهده رزومه
                  </Button>
                ),
              ];
            },
            flex: 1,
          },
        ]}
        rows={applications}
      />
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        keepMounted
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          پاسخ‌ها
        </DialogTitle>
        {currentApplication?.answers.map(({ question, answer, id }) => (
          <Accordion elevation={0} key={id}>
            <AccordionSummary>{question}</AccordionSummary>
            <AccordionDetails>{answer}</AccordionDetails>
          </Accordion>
        ))}
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
}
