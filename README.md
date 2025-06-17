# **VIBEE - Platform Media Sosial Sederhana**

Selamat datang di VIBEE, sebuah platform media sosial sederhana yang dirancang untuk menjadi wadah interaksi dan berbagi konten antar pengguna. Project ini untuk showcase menampilkan kemampuan dalam pengembangan aplikasi web modern.

## **Tentang Aplikasi VIBEE**

VIBEE adalah platform media sosial minimalis yang berfokus pada kemudahan berbagi pemikiran, gambar, dan berinteraksi melalui *likes* dan komentar. Aplikasi ini dirancang untuk menyediakan pengalaman pengguna yang intuitif tanpa kompleksitas fitur *following* atau *followers*, sehingga fokus utama adalah pada konten dan interaksi langsung.

**Fitur Utama:**

* **Autentikasi Pengguna:** Pengguna dapat mendaftar dan masuk untuk mengakses fitur-fitur aplikasi.
* **Postingan:** Pengguna dapat membuat postingan berupa teks dan gambar.
* **Interaksi:** Pengguna lain (dan diri sendiri) dapat memberikan *like* pada postingan dan meninggalkan komentar.
* **Tampilan Beranda:** Menampilkan *feed* postingan dari semua pengguna secara kronologis.
* **Profil Pengguna:** Halaman profil pribadi untuk melihat semua postingan yang dibuat pengguna.
* **Desain Responsif:** Tampilan yang optimal di berbagai ukuran perangkat.

## **Teknologi yang Digunakan**

VIBEE dibangun dengan tumpuan teknologi modern untuk memastikan kinerja dan skalabilitas:

* **Next.js:** Framework React untuk *Server-Side Rendering* (SSR) dan *routing*.
* **TypeScript:** Bahasa pemrograman yang *type-safe* untuk kualitas kode yang lebih baik.
* **Prisma ORM:** *Next-generation ORM* untuk interaksi database yang mudah dan aman.
* **PostgreSQL (via Neon):** Database relasional yang skalabel, dihosting secara *serverless* oleh Neon.
* **Tailwind CSS:** Framework CSS *utility-first* untuk styling yang cepat dan konsisten.
* **Clerk:** Solusi autentikasi dan manajemen pengguna yang *production-ready*.
* **Uploadthing:** Untuk penanganan upload file yang mudah dan efisien.
* **Framer Motion:** Untuk animasi UI yang interaktif dan *smooth*.

## **Peran IBM Granite dalam Pengembangan Proyek Ini**

Proyek VIBEE ini juga menjadi bukti eksplorasi saya dalam memanfaatkan kekuatan **model AI seperti IBM Granite** dalam proses pengembangan perangkat lunak. Model IBM Granite telah menjadi asisten yang tak ternilai dalam berbagai aspek proyek ini, termasuk:

* **Pembentukan Logika Inti:** Dalam menyusun logika untuk fitur-fitur krusial seperti proses pembuatan postingan, mekanisme komentar, dan pengelolaan *likes*, model IBM Granite banyak membantu dalam menyusun alur berpikir dan implementasi awal.
* **Pengembangan Method dan Fungsi JavaScript/TypeScript:** Ketika saya membutuhkan bantuan dalam merancang atau memperbaiki *method* dan fungsi-fungsi JavaScript/TypeScript yang kompleks, model ini memberikan saran, contoh kode, dan panduan untuk memastikan kode yang bersih dan efisien.
* **Pemecahan Masalah (Debugging):** Saat menghadapi *error* atau perilaku tak terduga dalam aplikasi, model IBM Granite berfungsi sebagai alat *debugging* interaktif. Model ini membantu menganalisis pesan *error*, mengidentifikasi potensi penyebab, dan menyarankan solusi yang tepat, mempercepat proses pengembangan secara signifikan.
* **Saran Arsitektur dan Best Practices:** Dalam beberapa kasus, model ini juga memberikan wawasan tentang *best practices* dan pola arsitektur yang dapat diterapkan, khususnya dalam konteks Next.js dan interaksi database menggunakan Prisma.

Pemanfaatan model IBM Granite memungkinkan saya untuk lebih fokus pada konsep arsitektur dan *user experience*, sambil mempercepat implementasi detail teknis dan pemecahan masalah yang kompleks. Ini menunjukkan potensi besar AI sebagai kolaborator dalam proses rekayasa perangkat lunak.

## **Mulai Menggunakan Proyek Ini**

Ikuti langkah-langkah di bawah untuk menjalankan proyek VIBEE di lingkungan lokal Anda:

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/your-username/vibee.git](https://github.com/your-username/vibee.git)
    cd vibee
    ```

2.  **Instal dependensi:**
    ```bash
    pnpm install
    # atau npm install / yarn install
    ```

3.  **Siapkan variabel lingkungan:**
    * Buat file `.env.local` di root proyek.
    * Dapatkan kredensial database PostgreSQL dari Neon (atau penyedia database lain).
    * Dapatkan kunci API dari Clerk dan Uploadthing.
    * Isi file `.env.local` dengan variabel-variabel berikut:
        ```env
        DATABASE_URL="<URL_DATABASE_PRISMA_ANDA>"
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<CLERK_PUBLISHABLE_KEY>"
        CLERK_SECRET_KEY="<CLERK_SECRET_KEY>"
        NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in" # Jika Anda punya halaman login kustom
        NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up" # Jika Anda punya halaman register kustom
        UPLOADTHING_SECRET="<UPLOADTHING_SECRET_KEY>"
        UPLOADTHING_APP_ID="<UPLOADTHING_APP_ID>"
        ```

4.  **Inisialisasi Prisma & Database:**
    ```bash
    npx prisma db push # Untuk sinkronisasi skema ke database
    npx prisma generate # Untuk menghasilkan Prisma Client
    ```

5.  **Jalankan server pengembangan:**
    ```bash
    pnpm dev
    # atau npm run dev / yarn dev
    ```

6.  Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi VIBEE berjalan.