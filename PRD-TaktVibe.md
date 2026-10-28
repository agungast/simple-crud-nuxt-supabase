# Product Requirement Document (PRD)
## TaktVibe — Personal Task & Knowledge Management System

---

## 1. Document Overview
* **Product Name**: TaktVibe (formerly TaskFlow)
* **Version**: 1.2.0 (AI Engine & Q4 2026 Roadmap Extension)
* **Target Audience**: Solo Developers, Freelancers, Indie Hackers, Content Creators, Students
* **Tech Stack**:
  * **Frontend & SSR**: Nuxt 4 (`^4.5.2`) dengan Vue 3.5 (Composition API & `<script setup>`)
  * **State Management**: Pinia (`@pinia/nuxt ^1.0.2`, `pinia ^4.0.3`)
  * **Language & Types**: TypeScript (`strict: true`)
  * **Styling & Design System**: **Pure Vanilla CSS & Modern Design Tokens** (`app/assets/css/theme.css` + Scoped CSS). **Tanpa Tailwind CSS**, mematuhi standar *Anti-AI Slop Guidelines* (Tipografi `Outfit`, kurva transisi *exponential ease-out*, kontras warna WCAG AA).
  * **Backend & Database**: Supabase (`@nuxtjs/supabase ^2.0.10`): PostgreSQL, Supabase Auth (RLS), Supabase Storage (Public & Private Signed URLs), Supabase Realtime Channels, `pg_cron`.
  * **Application Security**: `nuxt-security ^2.6.0` (Strict Content Security Policy berbasis Nonce, Helmet, CSRF guard, secure cookies di mode produksi).
  * **AI Engine & Serverless API**: Nuxt Nitro Server Routes (`server/api/ai/*`) dengan Google Gemini 1.5 Flash SDK / OpenAI SDK.

---

## 2. Product Vision & Problem Statement

### 2.1 Vision
TaktVibe (berasal dari ritme *"takt time"* dan fokus *"vibe"*) menggabungkan ketegasan pelacakan alur kerja dan prioritas ala **Jira** dengan fleksibilitas dokumentasi catatan/halaman ala **Notion**, yang dioptimalkan secara spesifik untuk **pengguna tunggal (solo builder / developer)** tanpa birokrasi kolaborasi tim.

### 2.2 Problem Statement
* **Jira** terlalu kaku dan berlebihan (*over-engineered*) untuk individu, dengan konfigurasi Scrum/Sprint/Permission tim yang tidak relevan bagi solo user.
* **Notion** sangat fleksibel namun sering terasa lambat (*bloated*), kurang optimal untuk visualisasi *time estimate*, pelacakan *deadline*, dan pembersihan data otomatis.
* Aplikasi *to-do* standar terlalu sederhana (hanya sekadar checkbox tanpa konteks detail atau manajemen proyek terstruktur).

---

## 3. User Personas & Use Cases

### User Persona: The Solo Builder / Indie Developer
* **Needs**: 
  * Mengatur *backlog* ide fitur dan *bug* dengan estimasi waktu.
  * Menulis catatan teknis/dokumentasi kaya langsung di dalam tiket tugas.
  * Melihat beban kerja mingguan (*focus cycle*) tanpa repot mengatur alur approval.
* **Pain Points**:
  * Berpindah-pindah aplikasi antara Notion (catatan) dan Jira/Trello (papan tugas).
  * Data tugas menumpuk tanpa pembersihan otomatis.

---

## 4. Functional Requirements & Feature Specifications

### 4.1 Multi-View Task Board (Jira + Notion Hybrid)
* **Table View (Default)**: Menampilkan data tabular terstruktur dengan filter pencarian instan (*live search*), sortir prioritas, indikator lampiran, dan badge status[cite: 1].
* **Kanban Board**: Tampilan kolom status (*BACKLOG*, *TODO*, *IN_PROGRESS*, *DONE*) dengan dukungan *drag-and-drop* untuk mengubah status secara intuitif.
* **Calendar / Timeline View**: Visualisasi tugas berbasis `due_date` untuk memetakan beban harian dan mingguan.

### 4.2 Rich Detail & Markdown Workspace (Notion Style)
* Setiap tugas memiliki modal/halaman detail luas yang mendukung penulisan format **Markdown** (headings, bold, lists, code block, hyperlinks).
* **Checklist / Subtasks**: Kemampuan menambahkan sub-tugas bersarang di dalam satu tugas utama dengan bilah kemajuan (*progress bar*) otomatis.

### 4.3 Issue Attributes & Metadata (Jira Style)
* **Priority Levels**: `LOW`, `MEDIUM`, `HIGH`, `URGENT` dengan badge warna kontras.
* **Task Categories / Projects**: Pengelompokan tugas ke dalam ruang kerja (*Spaces*) dengan ikon dan warna kustom.
* **Time Estimation & Story Points**: Kolom input `estimated_hours` untuk memantau durasi pengerjaan.
* **Tags & Labels**: Sistem penanda fleksibel berbentuk array string (misal: `frontend`, `bug`, `research`).

### 4.4 Media & Storage Management
* Upload lampiran berkas/screenshot langsung ke **Supabase Storage**[cite: 1].
* Preview media resolusi penuh via **Image Lightbox Modal**[cite: 1].

### 4.5 Safety UX & Realtime Feedback
* **Destructive Action Protection**: Modal konfirmasi sebelum menghapus tugas secara permanen[cite: 1].
* **Toast Notifications**: Notifikasi instan di sudut layar saat Create, Update, dan Delete berhasil.
* **Realtime Activity Log**: Panel pemantauan perubahan data database secara *real-time* via Supabase Channel[cite: 1].
* **Automated Housekeeping**: Integrasi `pg_cron` untuk mengarsipkan atau menghapus tugas berstatus `DONE` setelah durasi tertentu (misal > 30 hari)[cite: 1].

### 4.6 AI Productivity Engine (Context-Aware AI Assistant & Automation)
* **4.6.1 AI Subtask Breakdown ("Pecah Tugas Otomatis")**:
  - Tombol aksi 1-klik di modal detail tugas untuk memecah tugas kompleks menjadi 4–6 subtask terstruktur.
  - Mengirim judul & deskripsi tugas ke model AI, mengembalikan daftar checklist siap simpan ke tabel `subtasks`.
* **4.6.2 Natural Language Quick Add (Input Bahasa Alami)**:
  - Input teks satu baris pada dashboard / Command Palette: *"Beli domain besok jam 3 sore untuk proyek TaktVibe prioritas urgent estimasi 2 jam"*.
  - AI mengekstrak entitas (judul, tanggal jatuh tempo, prioritas, relasi proyek, estimasi waktu, tag) dalam format JSON terstruktur untuk pembuatan instan.
* **4.6.3 TaktVibe Copilot (Context-Aware Chatbot)**:
  - Asisten chat samping (*docked drawer*) yang memiliki konteks daftar tugas aktif, proyek, dan deadline pengguna.
  - Mampu menjawab pertanyaan analitis (*"Tugas prioritas mana yang paling mendesak minggu ini?"*) dan memicu *Function Calling* untuk membuat atau memindahkan status tugas langsung via chat.
* **4.6.4 AI Standup & Weekly Briefing Generator**:
  - Generator 1-klik untuk merangkum progres mingguan (tugas selesai, waktu dihabiskan, tugas tertunda, rekomendasi prioritas minggu depan).
  - Hasil dalam format Markdown siap ekspor untuk laporan klien atau catatan mingguan pribadi.
* **4.6.5 AI Spec & Acceptance Criteria Generator**:
  - Generator otomatis di dalam editor Markdown tugas untuk menyusun kriteria selesai (*Acceptance Criteria*) dan kerangka implementasi teknis.

### 4.7 Focus & Power-User Tools (Vibe & Execution)
* **4.7.1 Command Palette (`Ctrl + K` / `Cmd + K`)**:
  - Modal navigasi cepat tanpa mouse: *fuzzy search* tugas, lompat ke proyek/space, ubah view (Tabel/Kanban/Kalender), dan buat tugas cepat.
  - Shortcut global keyboard (`c` buat tugas, `/` cari, `Esc` tutup).
* **4.7.2 Pomodoro Timer & Focus Mode (Tracking Jam Riil)**:
  - Mode fokus layar penuh / widget pojok dengan interval Pomodoro (25m kerja / 5m istirahat) yang terikat langsung ke tugas aktif.
  - Kolom `actual_hours` untuk membandingkan durasi kerja nyata vs estimasi (`estimated_hours`).
* **4.7.3 Project Wiki / Knowledge Scratchpad (Notion-Style Spaces)**:
  - Tab dokumentasi bebas per proyek/space untuk menyimpan catatan teknis, link referensi, dan arsitektur tanpa harus membuat tugas dummy.
* **4.7.4 Task Templates & Recurring Tasks**:
  - Template siap pakai untuk jenis tugas umum (*Bug Report*, *Feature Spec*, *Client Invoice*).
  - Dukungan tugas berulang (Harian, Mingguan, Bulanan).
* **4.7.5 Productivity Analytics & Data Export**:
  - Dashboard visual metrik produktivitas: rasio ketepatan waktu, distribusi prioritas, total jam kerja per proyek.
  - Ekspor data riwayat ke format CSV dan Markdown.

---

## 5. Database Schema Specification (Supabase PostgreSQL)

```sql
-- 1. Enum Types
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE task_status AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED');

-- 2. Projects Table (Spaces ala Notion)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Project Notes Table (Wiki / Scratchpad per Project)
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content_markdown TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table (Jira Issue + Notion Doc Hybrid)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description_markdown TEXT DEFAULT '',
  status task_status DEFAULT 'TODO' NOT NULL,
  priority task_priority DEFAULT 'MEDIUM' NOT NULL,
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  estimated_hours NUMERIC(4, 1) DEFAULT 0,
  actual_hours NUMERIC(4, 1) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Subtasks Table (Checklist)
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Task Templates Table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  description_markdown TEXT DEFAULT '',
  priority task_priority DEFAULT 'MEDIUM' NOT NULL,
  tags TEXT[] DEFAULT '{}',
  estimated_hours NUMERIC(4, 1) DEFAULT 0,
  subtasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo user full access to projects" ON projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo user full access to project_notes" ON project_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo user full access to tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo user full access to subtasks" ON subtasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Solo user full access to task_templates" ON task_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 6. AI Architecture & Nitro Server Endpoints

Untuk menjaga keamanan kunci API dan kecepatan respon, seluruh interaksi AI diproses melalui Nuxt Server Endpoints (`server/api/ai/`):

| Endpoint | Method | Fungsi | Input Payload | Output Format |
| :--- | :--- | :--- | :--- | :--- |
| `/api/ai/breakdown` | `POST` | Memecah tugas menjadi subtasks terstruktur | `{ title: string, description?: string }` | `{ subtasks: string[] }` |
| `/api/ai/quick-parse` | `POST` | Mengekstrak teks bahasa alami menjadi atribut tugas | `{ prompt: string, current_projects: string[] }` | `{ title, project?, priority, due_date?, estimated_hours?, tags }` |
| `/api/ai/chat` | `POST` | Asisten kontekstual berbasis data tugas pengguna | `{ message: string, history: [], tasks_summary: [] }` | `{ reply: string, suggested_action?: object }` |
| `/api/ai/briefing` | `POST` | Menghasilkan rangkuman harian/mingguan | `{ period: 'daily' \| 'weekly', completed_tasks: [], pending_tasks: [] }` | `{ summary_markdown: string, highlights: string[] }` |

* **Model Default:** Google Gemini 1.5 Flash (atau OpenAI gpt-4o-mini).
* **Keamanan:** API Key diakses via `useRuntimeConfig().aiApiKey` di sisi server saja.
* **Autentikasi:** Server endpoint memvalidasi token sesi Supabase (`serverSupabaseUser(event)`).

---

## 7. Execution Roadmap (Target: Desember 2026 — 8 Minggu)

### 🗓️ Fase 1: Focus Tools & AI Subtask Engine (November, Minggu 1 – 2)
* [x] **Sprint 1 (Focus Mode & Pomodoro Timer):**
  - Migrasi Supabase: Tambah kolom `actual_hours` di tabel `tasks` ([`11_add_actual_hours_to_todos.sql`](file:///d:/Talenavi/CRUD_Nuxt/takt-vibe-app/supabase/migrations/11_add_actual_hours_to_todos.sql)).
  - Bangun UI Focus / Pomodoro Timer di dashboard yang mencatat durasi tugas aktif ([`FocusTimer.vue`](file:///d:/Talenavi/CRUD_Nuxt/takt-vibe-app/app/components/FocusTimer.vue)).
* [x] **Sprint 2 (AI Subtask Breakdown):**
  - Setup Nuxt server route `/api/ai/breakdown` dengan Google Gemini SDK ([`breakdown.post.ts`](file:///d:/Talenavi/CRUD_Nuxt/takt-vibe-app/server/api/ai/breakdown.post.ts)).
  - Tambahkan tombol "Pecah Tugas dengan AI" pada modal detail tugas dengan opsi *insert to subtasks* ([`TaskDetailModal.vue`](file:///d:/Talenavi/CRUD_Nuxt/takt-vibe-app/app/components/TaskDetailModal.vue)).

### 🗓️ Fase 2: Natural Language Input & Knowledge Space (November, Minggu 3 – 4)
* [ ] **Sprint 3 (AI Natural Language Quick Add & Templates):**
  - Endpoint `/api/ai/quick-parse` untuk konversi kalimat bebas ke field tugas.
  - Komponen Quick Input bar di dashboard.
  - Implementasi tabel `task_templates` & modal pilih template tugas.
* [ ] **Sprint 4 (Project Wiki / Knowledge Scratchpad):**
  - Migrasi Supabase: Buat tabel `project_notes` dengan RLS.
  - Tab catatan/wiki di dalam halaman/modal proyek (editor Markdown rich note).

### 🗓️ Fase 3: Power-User Nav & Context-Aware Copilot (Desember, Minggu 5 – 6)
* [ ] **Sprint 5 (Command Palette `Ctrl+K` & Shortcuts):**
  - Modal Command Palette instan dengan *fuzzy search*.
  - Integrasi pencarian tugas, pergantian ruang kerja, toggle tema, dan Quick Add AI.
  - Keyboard shortcut navigasi daftar tugas (`c`, `/`, `Esc`).
* [ ] **Sprint 6 (TaktVibe Copilot — AI Task Assistant):**
  - Endpoint `/api/ai/chat` dengan injeksi ringkasan tugas aktif.
  - Drawer chat samping dengan dukungan *action suggestions* (buat tugas langsung dari chat).

### 🗓️ Fase 4: Analytics, PWA & Final Hardening (Desember, Minggu 7 – 8)
* [ ] **Sprint 7 (AI Weekly Briefing, Analytics & Export):**
  - Endpoint `/api/ai/briefing` untuk laporan progres mingguan otomatis.
  - Halaman analitik metrik produktivitas (rasio penyelesaian, beban jam kerja).
  - Fitur ekspor riwayat ke CSV dan Markdown.
* [ ] **Sprint 8 (PWA Offline, Testing & Portfolio Launch):**
  - Integrasi `@vite-pwa/nuxt` (manifest, service worker, installable app).
  - E2E testing alur kritis (Auth, CRUD, AI generation).
  - Audit Lighthouse (100% Performance & Accessibility) dan dokumentasi rilis v1.2.0.