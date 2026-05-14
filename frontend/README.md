# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🏠 Sistem Booking Ruangan
Aplikasi full-stack booking ruangan menggunakan **Django + Node.js + React + Flask Swagger**.

## Cara Menjalankan Aplikasi

**jalankan 4 service secara bersamaan.**
1. Terminal 1 — Django Backend

cd backend
.\venv\Scripts\Activate
python manage.py runserver

url: http://127.0.0.1:8000/admin

3. terminal 3 - frontend

cd frontend
npm run dev

url: http://localhost:5173

4. terminal 4 - flaskger

cd flask-swagger
python app.py

url: http://127.0.0.1:5001
