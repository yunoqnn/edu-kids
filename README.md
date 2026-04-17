# StudyComp

Бага сургуулийн 1–5 дугаар ангийн сурагчдад зориулсан тоглоомжуулсан сургалтын платформ.

## Технологи

- **Next.js 15** (App Router)
- **Prisma** (ORM)
- **Supabase PostgreSQL** (Database)
- **JWT + bcrypt** (Authentication)
- **Tailwind CSS**

## Суулгах заавар

### 1. Хамаарлуудыг суулгах

```bash
npm install
```

### 2. Supabase тохиргоо

1. [supabase.com](https://supabase.com) дээр шинэ project үүсгэнэ
2. Project Settings → Database → Connection string хэсгээс URL авна
3. `.env.example` файлыг `.env.local` болгон хуулж, утгуудыг оруулна

```bash
cp .env.example .env.local
```

### 3. Database schema үүсгэх

```bash
npx prisma generate
npx prisma db push
```

### 4. Development server ажиллуулах

```bash
npm run dev
```

→ http://localhost:3000

## Хэрэглэгчийн дараалал

### Эцэг эх
1. `/` → "Эцэг эхээр нэвтрэх" товч
2. Бүртгүүлэх → `/parent/dashboard`
3. Хүүхдийн профайл нэмэх

### Контент бүтээгч
1. `/` → "Контент бүтээгч" товч
2. Бүртгүүлэх → `/creator/dashboard`
3. "Дасгал/Тест нэмэх" → тоглоомын төрөл сонгох → агуулга оруулах

### Тоглоомын демо
→ `/games` хаягаар 3 тоглоомыг туршиж үзэх боломжтой

## Тоглоомын төрлүүд

| Тоглоом | Тайлбар |
|---|---|
| 🃏 Memory Card | Зураг-Үг хослол тааруулах |
| 🧩 Drag & Drop | Зүйлсийг ангилалд чирж байрлуулах |
| 🔢 Тооны гинж | Дараалалд дараагийн тоог таах |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Database schema push
npm run db:generate  # Prisma client generate
npm run db:studio    # Prisma Studio (DB GUI)
```
