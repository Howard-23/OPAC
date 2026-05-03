import { BookOpen, LayoutDashboard, LogOut, PencilRuler, Repeat } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/authors", label: "Authors", icon: PencilRuler },
  { to: "/rentals", label: "Circulation", icon: Repeat }
];

function navClasses({ isActive }) {
  return [
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
    isActive ? "bg-brass-500 text-ink-950" : "text-white/75 hover:bg-white/10 hover:text-white"
  ].join(" ");
}

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel flex h-full flex-col overflow-hidden">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">Library System</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-white">Catalog Desk</h1>
            <p className="mt-2 text-sm text-white/60">Modern inventory and circulation workspace.</p>
          </div>

          <div className="px-4 py-4">
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brass-200/70">Signed in</p>
              <p className="mt-2 font-medium text-white">{user?.username}</p>
              <p className="text-sm text-white/60">{user?.role}</p>
            </div>

            <nav className="space-y-2">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"} className={navClasses}>
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto px-4 pb-4">
            <button type="button" className="btn-secondary w-full gap-2" onClick={logout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="panel overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
