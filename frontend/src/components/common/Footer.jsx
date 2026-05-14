export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 text-center text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} RoomBook System. All rights reserved.</p>
        <p className="mt-2 text-slate-500">Modern, Responsive, Fully Functional</p>
      </div>
    </footer>
  );
}
