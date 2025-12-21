# YourLingo
YourLingo is basically DuoLingo but you control the content.


to run prisma studio run the following command:
```bash
npx prisma studio

```

And this is complete Prisma workflow:
```bash
# 1. Create your schema.prisma (you already have this)

# 2. Create tables and generate client
npx prisma migrate dev --name init

# 3. View your tables
npx prisma studio

# 4. (Optional) If you change schema later, regenerate client
npx prisma generate
```