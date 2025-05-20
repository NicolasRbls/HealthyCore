import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-[250px] transition-all duration-300">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
