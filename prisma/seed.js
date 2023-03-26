const { PrismaClient } = require('@prisma/client')

const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
  const username = 'admin'

  // cleanup the existing database
  await prisma.admin.delete({ where: { username } }).catch(() => {
    // no worries if it doesn't exist yet
  })

  const hashedPassword = await bcrypt.hash(
    process.env.DEFAULT_ADMIN_PASSWORD,
    10
  )
  await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  })

  console.log('Database has been seeded. 🌱')
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
