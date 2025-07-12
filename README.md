# 🍷 Hometown Liquors

Hometown Liquors is a full-featured e-commerce platform designed to power a real-world liquor store with a clean, scalable, and responsive online experience. Built from scratch for my family's store, it brings traditional inventory and customer service into the digital age — with full mobile compatibility, modern UI/UX, and real-time backend infrastructure.

---

## 🎯 Project Overview

This website was developed for my family's **Hometown Liquors** retail store to:

- Let customers browse and search for products from any device
- Place online orders for in-store pickup (no delivery)
- Save favorite items and receive stock-related alerts
- Submit and view product reviews
- View their past orders and receipts
- Access a fast, intelligent search experience with Algolia

This project reflects a **real operational system** — not just a portfolio piece. It's both a technical exercise and a live commercial product.

---

## ✨ Key Features

### Customer Experience

- 🖼️ **Responsive design** built with React + TailwindCSS (fully mobile-ready)
- 🔥 **Firebase Auth + Firestore** for secure login, user profiles, and order data
- 🛒 Cart system with real-time totals, item quantity controls, and product validation
- 📦 **Order placement** system with pickup time and instructions
- 🛎️ **Notification preferences**: low stock, new arrivals, restocks
- ❤️ **Favorites system** stored in Firestore for personalized experience
- ⭐ Full **reviews and star ratings** per product
- 🌙 **Dark/light mode** toggle with custom CSS variable theming
- 🔍 **Algolia-powered search** for instant, typo-tolerant, paginated results
- 📱 Designed for **QR code scanning and quick mobile access**

### Product Management

- 📷 **Product image integration** via script + manual curation
- Real-time inventory tracking and validation

---

## 🔧 Admin Features (In Progress)

- View and manage all incoming orders
- Update product information and inventory
- Review customer order history and trends
- Generate sales and inventory reports (PDF export + filters)
- Control featured products and promote new arrivals

---

## 🛣️ Roadmap

- 🔐 **Role-based access control** for staff/admins
- 📊 Integrated analytics dashboard with sales KPIs, inventory trends, and more
- 📤 Server-side **email notifications** (via SendGrid or Firebase)
- 💳 **Online payments** (Stripe integration — post age verification process)
- 🔌 Future POS system integration for live inventory sync
- 📈 AI-powered product recommendations and dynamic restocking suggestions

---

## 🚀 Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Frontend       | React, TailwindCSS, Vite               |
| Backend        | Firebase (Firestore, Auth, Functions)  |
| Search         | **Algolia** (Algolia + Firestore Sync) |
| Hosting        | Firebase Hosting (soon)                |
| Notifications  | React Hot Toast, Firestore triggers    |
| Icons          | Lucide-react                           |
| Routing        | React Router                           |
| Reports/Charts | Recharts (planned)                     |
| Automation     | Python scripts for product/image sync  |

---

## 📁 Project Structure

```
src/
├── components/     # Shared UI components
├── pages/          # Route-specific pages (Products, Dashboard, etc.)
├── contexts/       # Global state (Auth, Cart, Firestore, etc.)
├── services/       # Firebase + Algolia configuration
└── assets/         # Static media and branding
```

---

## 💼 Why This Project Matters

- **Real-world impact** — supports a fully operational retail store
- Designed for **scalability**, **speed**, and **ease of use**
- Demonstrates **full-stack engineering** across React, Firebase, and external APIs
- Applies **business-critical features** like customer engagement, order management, and stock intelligence
- Built to grow with the business — from MVP to enterprise-grade backend

---

## 🚧 Development Status

> 🧪 Still in development — but already powering real infrastructure.
>
> **Next milestone**: polishing admin tools and launching live to public customers.
