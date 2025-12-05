const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@erp.com';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    console.log(`Password for ${user.email} has been reset to: ${newPassword}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
