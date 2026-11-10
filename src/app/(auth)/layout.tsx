export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <section className="bg-background flex w-full flex-col items-center px-4 pt-20 lg:w-[39%]">
        {children}
      </section>
      <div aria-hidden className="auth-visual hidden flex-1 bg-cover bg-center lg:block" />
    </main>
  );
}
