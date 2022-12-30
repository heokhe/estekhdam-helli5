import {
  Form,
  useLoaderData,
  useTransition,
  useFetcher,
} from '@remix-run/react';
import { prisma } from '~/db.server';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  ListItemText,
  ListItem,
  IconButton,
  Grid,
  ListItemButton,
  TextField,
  List,
  InputBase,
  Divider,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useState } from 'react';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { CategoryList } from '~/components/CategoryList';
import { json } from '@remix-run/server-runtime';
import { useEffect } from 'react';
import { Box } from '@mui/system';

export async function loader() {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
        include: {
          subcategories: {
            include: {
              data: {
                include: {
                  questions: true,
                },
              },
            },
          },
        },
      },
      parent: true,
      applications: false,
    },
    where: { parent: null },
  });
  return categories;
}

function findCategory(categories, id) {
  if (!categories) return undefined;
  for (const category of categories) {
    if (category.id === id) {
      return category;
    } else if (category.subcategories) {
      const innerCat = findCategory(category.subcategories, id);
      if (innerCat) return innerCat;
    }
  }
  return undefined;
}

export async function action({ request }) {
  const formData = await request.formData();
  console.log(Object.fromEntries(formData.entries()));
  const action = formData.get('action');
  if (action === 'new-question') {
    const categoryId = parseInt(formData.get('category'));
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { data: true },
    });
    const questionTitle = formData.get('question');
    const question = await prisma.question.create({
      data: {
        title: questionTitle,
        categoryDataId: category.data.id,
      },
    });
    return json(question);
  }
  if (action === 'new-category') {
    const parentId = formData.get('parentId');
    const hasParent = parentId && parentId !== 'undefined';
    const title = formData.get('title');
    const hasSubcategories = formData.get('hasSubcategories') === 'true';
    const newCategory = await prisma.category.create({
      data: {
        title,
        ...(hasParent && { parentId: parseInt(parentId) }),
      },
    });
    if (!hasSubcategories) {
      const data = await prisma.categoryData.create({
        data: {
          requiresCV: true,
        },
      });
      await prisma.category.update({
        where: {
          id: newCategory.id,
        },
        data: {
          data: {
            connect: {
              id: data.id,
            },
          },
        },
      });
    }
    return json(newCategory);
  }
  if (action === 'delete-category') {
    const categoryId = parseInt(formData.get('category'));
    // await prisma.categoryData.deleteMany({
    //   where: {
    //     Category: {
    //       every: {
    //         id: categoryId
    //       }
    //     }
    //   }
    // })
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    return json({});
  }
}

function AddCategoryDialog({ open, onClose, parentCategory, onSubmit }) {
  const [title, setTitle] = useState('');
  const [hasSubcategories, setHasSubcategories] = useState(false);
  function submit() {
    if (!title) return;
    const formData = new FormData();
    formData.set('action', 'new-category');
    formData.set('parentId', parentCategory?.id);
    formData.set('title', title);
    formData.set('hasSubcategories', hasSubcategories);
    onSubmit(formData);
    onClose();
  }
  useEffect(() => {
    if (!open) {
      setTitle('');
      setHasSubcategories(false);
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ unmountOnExit: true }}
    >
      <DialogTitle>
        اضافه کردن دسته‌بندی
        {parentCategory && `به «${parentCategory?.title}»`}
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="filled"
          label="نام دسته‌بندی"
          fullWidth
          autoFocus
          value={title}
          onInput={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />
        <FormGroup sx={{ my: 1, display: 'block' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasSubcategories}
                onChange={(event) => setHasSubcategories(event.target.checked)}
              />
            }
            label="می‌تواند زیرشاخه داشته باشد"
          />
        </FormGroup>
        <Typography variant="caption" color="text.secondary">
          تنها دسته‌بندی‌های بدون زیرشاخه قابلیت دریافت درخواست استخدام را دارند.{' '}
          <b>این ویژگی قابل ویرایش نیست.</b>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={submit}>ایجاد دسته‌بندی</Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteCategoryDialog({ open, onClose, onDelete, category }) {
  const handleDelete = () => {
    const formData = new FormData();
    formData.set('action', 'delete-category');
    formData.set('category', category.id);
    onDelete(formData);
    onClose();
  };

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
  );
}

export default function Categories() {
  const fetcher = useFetcher();
  /** @type {Awaited<ReturnType<typeof loader>>} */
  const categories = useLoaderData();
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addCategoryDialogParent, setAddCategoryDialogParent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
  const selectedCategory = findCategory(categories, selectedCategoryId);
  return (
    <>
      <Grid container>
        <Grid item xs={5} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <CategoryList
            maximumVisibleDepth={Infinity}
            categories={categories}
            renderFinalItem={(category) => (
              <ListItemButton
                key={`c${category.id}`}
                selected={category.id === selectedCategoryId}
              >
                <ListItemText primary={category.title} />
                <IconButton onClick={() => setSelectedCategoryId(category.id)}>
                  <EditOutlined />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setDeleteCategory(category);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteOutline />
                </IconButton>
              </ListItemButton>
            )}
            parentItemActions={(category) => (
              <>
                <IconButton
                  onClick={() => {
                    setDeleteCategory(category);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteOutline />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setAddCategoryDialogOpen(true);
                    setAddCategoryDialogParent(category);
                  }}
                >
                  <Add />
                </IconButton>
              </>
            )}
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ my: 4 }}
          >
            <Button
              variant="contained"
              disableElevation
              startIcon={<Add />}
              size="large"
              onClick={() => {
                setAddCategoryDialogOpen(true);
              }}
            >
              افزودن دسته‌بندی جدید
            </Button>
          </Box>
        </Grid>
        <Grid item xs={7}>
          {selectedCategory ? (
            <>
              <Typography variant="h5" sx={{ mx: 2, my: 3 }}>
                ویرایش سوالات «{selectedCategory.title}»
              </Typography>
              <List disablePadding>
                {selectedCategory.data?.questions.map((question) => (
                  <ListItem key={question.id}>
                    <ListItemText primary={question.title} />
                  </ListItem>
                ))}
                <Form method="post">
                  <input type="hidden" name="action" value="new-question" />
                  <input
                    type="hidden"
                    name="category"
                    value={selectedCategoryId}
                  />
                  <ListItem>
                    <InputBase
                      fullWidth
                      autoComplete="off"
                      placeholder="سوال جدید..."
                      name="question"
                    />
                  </ListItem>
                </Form>
              </List>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ m: 2, mt: 1 }}
              >
                {selectedCategory.data?.questions.length ?? 0} سوال
              </Typography>
            </>
          ) : (
            <Box
              sx={{ color: 'text.secondary' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              از سمت راست یک دسته‌بندی انتخاب کنید.
            </Box>
          )}
        </Grid>
      </Grid>
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        category={deleteCategory}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={(data) => {
          fetcher.submit(data, { method: 'post', replace: true });
        }}
      />
      <AddCategoryDialog
        open={addCategoryDialogOpen}
        parentCategory={addCategoryDialogParent}
        onClose={() => setAddCategoryDialogOpen(false)}
        onSubmit={(data) => {
          fetcher.submit(data, { method: 'post', replace: true });
        }}
      />
    </>
  );
}
