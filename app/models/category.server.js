import { prisma } from '~/db.server'

/**
 * @returns all categories with their data
 */
export async function getCategories() {
  const data = {
    include: { questions: true },
  }

  return await prisma.category.findMany({
    include: {
      data,
      subcategories: {
        include: {
          data,
          subcategories: {
            include: {
              data,
              subcategories: {
                include: {
                  data,
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
  })
}
