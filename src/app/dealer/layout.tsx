export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-black min-h-screen">
      {children}
    </div>
  );
}
