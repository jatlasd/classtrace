import { BarChart3, Hash, LayoutList, Users } from "lucide-react";

const items = [
  { icon: LayoutList, label: "Feed", active: true },
  { icon: Users, label: "Students", active: false },
  { icon: Hash, label: "Tags", active: false },
  { icon: BarChart3, label: "Reports", active: false },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-2 lg:hidden">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 ${
            item.active ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <item.icon className="size-5" strokeWidth={item.active ? 2.25 : 1.75} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
