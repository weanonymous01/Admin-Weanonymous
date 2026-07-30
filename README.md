# We Anonymous - Admin Panel & Resend Email Engine

A standalone Admin Panel and Email Automation Suite for **We Anonymous**. Built with HTML5, Tailwind CSS, vanilla JavaScript, Lucide icons, Supabase Database SDK, and Resend API.

---

## Features & Functional Capabilities

### 1. Dashboard Overview
- **Real-Time Lead Statistics**: Live counters for Total Leads, Beginner Path, Intermediate Path, and Professional Path.
- **Opt-in Interest Metrics**: HackSnip 7-Day Bootcamp interest percentage bar and Weekly Newsletter subscriber count.
- **Recent Registrations Feed**: Live stream showing the latest lead registrations with timestamps and segment badges.

### 2. CSV-Style Leads Database (`/leads`)
- **Interactive Data Grid**: Full database table displaying Name, Contact Info (Email, Phone), Segment Tag, Linux Knowledge, Role, Experience, Opt-ins, and Timestamp.
- **Instant Search**: Real-time filtering by Name, Email, or Phone number.
- **Segment Filters**: Filter by `All`, `Beginner`, `Intermediate`, or `Professional` path tags.
- **One-Click CSV Export**: Download all filtered or complete lead records as a clean `.csv` spreadsheet file for Excel, Google Sheets, or CRM importing.

### 3. Resend Email Mailer (`/mailer`)
- **Audience Targeting**: Select recipient segment (`All Leads`, `Beginner Path Only`, `Intermediate Path Only`, `Professional Path Only`, or `HackSnip Bootcamp Opt-ins`).
- **Dynamic Template Placeholders**: Use `{{name}}`, `{{email}}`, and `{{segment}}` tags for personalizing email content.
- **Resend API Integration**: Direct client-side dispatch to Resend (`https://api.resend.com/emails`).
- **Test Email & Broadcast Execution**: Preview test drafts prior to running bulk email broadcasts.

### 4. Admin Security & Passcode Lock
- Passcode lock screen protecting dashboard access. Default passcode: `admin123` (customizable in Settings).

---

## Setup and Deployment Guide

### Step 1: Run Locally
Open `index.html` directly in your browser or run a static file server:

```bash
npx serve .
```

### Step 2: Configure Resend API Key
1. Get a free API key from [Resend.com](https://resend.com).
2. Go to **Resend Mailer** tab in the admin dashboard and paste your API key into the **Resend API Setup** box.
3. Configure your verified **From Email** (e.g. `onboarding@resend.dev` or `updates@weanonymous.in`).

### Step 3: Deploy Admin Panel
Deploy `index.html` to Vercel, Netlify, or Cloudflare Pages and map your custom domain **`admin.weanonymous.in`**.

---

## File Directory

- `index.html`: Complete single-page admin panel application.
- `README.md`: Documentation and deployment setup guide.
