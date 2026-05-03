import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/books", label: "Books" },
  { to: "/authors", label: "Authors" },
  { to: "/rentals", label: "Rentals" }
];

function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brass">Library Console</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Library Information System</h1>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Signed in as <span className="font-semibold">{user?.username}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Log Out
            </button>
          </div>
        </header>

        <nav className="panel flex flex-wrap gap-3 px-4 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-4 py-3 text-sm font-medium",
                  isActive ? "bg-teal-700 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
