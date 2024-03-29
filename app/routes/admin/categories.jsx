import { useLoaderData, useFetcher, Outlet, Link } from '@remix-run/react'
import { prisma } from '~/db.server'
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  ListItemText,
  IconButton,
  Grid,
  ListItemButton,
  TextField,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  DialogContent,
  DialogContentText,
  ListItemIcon,
} from '@mui/material'
import { useState, useEffect } from 'react'
import EditOutlined from '@mui/icons-material/EditOutlined'
import Add from '@mui/icons-material/Add'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import { CategoryList } from '~/components/CategoryList'
import { json } from '@remix-run/server-runtime'
import { getCategories } from '~/models/category.server'

export async function loader() {
  return await getCategories()
}

export async function action({ request }) {
  const formData = await request.formData()
  const action = formData.get('action')
  if (action === 'new-category') {
    const parentId = formData.get('parentId')
    const hasParent = parentId && parentId !== 'undefined'
    const title = formData.get('title')
    const hasSubcategories = formData.get('hasSubcategories') === 'true'
    const newCategory = await prisma.category.create({
      data: {
        title,
        ...(hasParent && { parentId: parseInt(parentId) }),
      },
    })
    if (!hasSubcategories) {
      await prisma.categoryData.create({
        data: {
          Category: {
            connect: {
              id: newCategory.id,
            },
          },
        },
      })
    }
    return json(newCategory)
  }
  if (action === 'delete-category') {
    const categoryId = parseInt(formData.get('category'))
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })
    await prisma.categoryData.deleteMany({
      where: {
        Category: {
          every: {
            id: categoryId,
          },
        },
      },
    })
    return json({})
  }
}

function AddCategoryDialog({ open, onClose, parentCategory, onSubmit }) {
  const [title, setTitle] = useState('')
  const [hasSubcategories, setHasSubcategories] = useState(false)
  function submit() {
    if (!title) return
    const formData = new FormData()
    formData.set('action', 'new-category')
    formData.set('parentId', parentCategory?.id)
    formData.set('title', title)
    formData.set('hasSubcategories', hasSubcategories)
    onSubmit(formData)
    onClose()
  }
  useEffect(() => {
    if (!open) {
      setTitle('')
      setHasSubcategories(false)
    }
  }, [open])
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ unmountOnExit: true }}
    >
      <DialogTitle>
        اضافه کردن دسته‌بندی {parentCategory && `به «${parentCategory?.title}»`}
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="filled"
          label="نام دسته‌بندی"
          fullWidth
          autoFocus
          value={title}
          onInput={event => setTitle(event.target.value)}
          autoComplete="off"
        />
        <FormGroup sx={{ my: 1, display: 'block' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasSubcategories}
                onChange={event => setHasSubcategories(event.target.checked)}
              />
            }
            label="می‌تواند زیرشاخه داشته باشد"
          />
        </FormGroup>
        <Typography variant="caption" color="text.secondary">
          تنها دسته‌بندی‌های بدون زیرشاخه قابلیت دریافت درخواست استخدام را
          دارند. <b>این ویژگی قابل ویرایش نیست.</b>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={submit}>ایجاد دسته‌بندی</Button>
      </DialogActions>
    </Dialog>
  )
}

function DeleteCategoryDialog({ open, onClose, onDelete, category }) {
  const handleDelete = () => {
    const formData = new FormData()
    formData.set('action', 'delete-category')
    formData.set('category', category.id)
    onDelete(formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>حذف دسته‌بندی «{category?.title}»</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <ul style={{ margin: 0 }}>
            <li>زیرشاخه‌های دسته‌بندی ذکر شده در صورت وجود حذف می‌شوند.</li>
            <li>
              تمامی درخواست‌های استخدام که برای این دسته‌بندی ارسال شده‌اند حذف
              خواهند شد.
            </li>
            <li>این عمل قابل بازگشت نیست.</li>
          </ul>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button color="error" onClick={handleDelete}>
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function Categories() {
  const fetcher = useFetcher()
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const categories = useLoaderData()
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false)
  const [addCategoryDialogParent, setAddCategoryDialogParent] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(-1)

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            borderWidth: 0,
            borderRightWidth: { xs: 0, md: 1 },
            borderBottomWidth: { xs: 1, md: 0 },
            borderColor: 'divider',
            borderStyle: 'solid',
          }}
        >
          <CategoryList
            maximumVisibleDepth={Infinity}
            categories={categories}
            renderFinalItem={category => (
              <ListItemButton
                key={`c${category.id}`}
                selected={category.id === selectedCategoryId}
              >
                <ListItemText primary={category.title} />
                <IconButton
                  LinkComponent={Link}
                  to={`${category.id}`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setDeleteCategory(category)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <DeleteOutline />
                </IconButton>
              </ListItemButton>
            )}
            parentItemActions={category => (
              <>
                <IconButton
                  onClick={() => {
                    setDeleteCategory(category)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <DeleteOutline />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setAddCategoryDialogOpen(true)
                    setAddCategoryDialogParent(category)
                  }}
                >
                  <Add />
                </IconButton>
              </>
            )}
          />
          <ListItemButton
            sx={{ color: 'primary.main' }}
            onClick={() => {
              setAddCategoryDialogOpen(true)
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Add />
            </ListItemIcon>
            <ListItemText primary="افزودن دسته‌بندی جدید" />
          </ListItemButton>
        </Grid>
        <Grid item xs={12} md={7}>
          <Outlet />
        </Grid>
      </Grid>
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        category={deleteCategory}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={data => {
          fetcher.submit(data, { method: 'post', replace: true })
        }}
      />
      <AddCategoryDialog
        open={addCategoryDialogOpen}
        parentCategory={addCategoryDialogParent}
        onClose={() => setAddCategoryDialogOpen(false)}
        onSubmit={data => {
          fetcher.submit(data, { method: 'post', replace: true })
        }}
      />
    </>
  )
}
