import { Form, useLoaderData, Link } from '@remix-run/react'
import { prisma } from '~/db.server'
import { DataGrid } from '@mui/x-data-grid'
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Toolbar,
  Avatar,
  Box,
  Grid,
  TextField,
  DialogContent,
  Chip,
  Tooltip,
} from '@mui/material'
import { useState } from 'react'

export async function loader() {
  const rawApplications = await prisma.application.findMany({
    include: {
      answers: true,
      category: {
        include: {
          parent: {
            include: {
              parent: {
                include: {
                  subcategories: true,
                },
              },
            },
          },
          data: {
            include: {
              questions: true,
            },
          },
        },
      },
    },
  })
  const applications = rawApplications.map(application => {
    return {
      ...application,
      answers: application.answers.map(answer => {
        const question = application.category.data.questions.find(
          q => q.id === answer.questionId
        )
        return {
          id: question.id,
          question: question.title,
          answer: answer.value,
        }
      }),
    }
  })
  return applications
}

export default function Applications() {
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const applications = useLoaderData()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentApplication, setCurrentApplication] = useState(null)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar sx={{ flexShrink: 0 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          پنل ادمین
        </Typography>
        <Button component={Link} to="categories" sx={{ mr: 1 }}>
          ویرایش دسته‌بندی‌ها
        </Button>
        <Form action="logout" method="post">
          <Button type="submit">خروج</Button>
        </Form>
      </Toolbar>
      <div style={{ height: '100%' }}>
        <DataGrid
          sx={{
            borderRight: 0,
            borderLeft: 0,
            borderBottom: 0,
            borderRadius: 0,
          }}
          disableSelectionOnClick
          columns={[
            {
              field: 'position',
              headerName: 'موقعیت شغلی',
              valueGetter: ({ row }) => {
                return row.category.title
              },
              renderCell: ({ value, row }) => {
                const list = []
                for (let last = row.category; last; last = last.parent) {
                  list.push(last)
                }
                return (
                  <Tooltip
                    title={list
                      .reverse()
                      .map(p => p.title)
                      .join('/')}
                  >
                    <Chip label={value} />
                  </Tooltip>
                )
              },
              width: 125,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'imageAddress',
              sortable: false,
              filterable: false,
              headerName: 'عکس',
              width: 80,
              align: 'center',
              headerAlign: 'center',
              renderCell: ({ value: imageAddress }) => {
                return imageAddress ? (
                  <Avatar
                    component="a"
                    href={imageAddress}
                    target="_blank"
                    src={imageAddress}
                  />
                ) : (
                  <Avatar />
                )
              },
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
              width: 125,
            },
            {
              field: 'birthDate',
              type: 'date',
              headerName: 'تاریخ تولد',
              width: 100,
              valueFormatter: ({ value }) =>
                new Date(value).toLocaleDateString('fa-IR'),
            },
            {
              field: 'email',
              headerName: 'آدرس ایمیل',
              width: 170,
            },
            {
              field: 'khedmatType',
              headerName: 'وضعیت نظام وظیفه',
              width: 175,
              valueGetter: ({ value }) =>
                ['معاف', 'پایان خدمت', 'مشمول'][value],
            },
            {
              field: 'marriageStatus',
              headerName: 'وضعیت تأهل',
              width: 125,
              valueGetter: ({ value }) => ['مجرد', 'متأهل'][value],
            },
            {
              field: 'recruitmentType',
              headerName: 'نوع استخدام',
              width: 125,
              valueGetter: ({ value }) => ['رسمی', 'آزاد'][value],
            },
            {
              field: 'اعمال',
              type: 'actions',
              flex: 1,
              minWidth: 300,
              getActions: ({ row }) => {
                return [
                  <Button
                    key="answers"
                    variant="contained"
                    disableElevation
                    onClick={() => {
                      setDialogOpen(true)
                      setCurrentApplication(row)
                    }}
                  >
                    مشاهده پاسخ‌ها
                  </Button>,
                  row.cvAddress ? (
                    <Button
                      key="cv"
                      href={row.cvAddress}
                      target="_blank"
                      variant="contained"
                      disableElevation
                    >
                      مشاهده رزومه
                    </Button>
                  ) : (
                    <></>
                  ),
                ]
              },
            },
          ]}
          rows={applications}
        />
        <Dialog
          maxWidth="md"
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          keepMounted
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
            پاسخ‌ها
          </DialogTitle>
          <DialogContent sx={{ pt: theme => `${theme.spacing(3)} !important` }}>
            <Grid container gap={2}>
              {currentApplication?.answers.map(({ question, answer, id }) => (
                <Grid item xs={12} md={6} key={id}>
                  <TextField
                    variant="filled"
                    multiline
                    maxRows={3}
                    value={answer}
                    label={question}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={() => setDialogOpen(false)}>بستن</Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  )
}
