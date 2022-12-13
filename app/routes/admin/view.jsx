import { useLoaderData } from '@remix-run/react';
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
} from '@mui/material';
import { useState } from 'react';

export async function loader() {
  const applications = await prisma.application.findMany({
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
  return applications.map((application) => {
    return {
      ...application,
      answers: application.answers.map((answer) => {
        const question = application.category.data.questions.find(
          (q) => q.id === answer.questionId,
        );
        return {
          question: question.title,
          answer: answer.value,
        };
      }),
    };
  });
}

export default function Export() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const applications = useLoaderData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  return (
    <>
      <DataGrid
        autoHeight
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
            field: 'actions',
            type: 'actions',
            getActions: ({ row }) => {
              return [
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    setDialogOpen(true);
                    setCurrentApplication(row);
                  }}
                >
                  مشاهده پاسخ‌ها
                </Button>,
              ];
            },
            width: 200,
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
        {currentApplication?.answers.map(({ question, answer }, index) => (
          <Accordion elevation={0} key={`${question}-${answer}`}>
            <AccordionSummary>{question}</AccordionSummary>
            <AccordionDetails>{answer}</AccordionDetails>
          </Accordion>
        ))}
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
