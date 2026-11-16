import Logo from "@/src/components/Logo";
import AuthVisual from "@/src/components/auth/AuthVisual";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <section className="bg-background flex w-full flex-col items-center px-4 pt-20 lg:w-[39%]">
        <Logo className="text-brand w-[253px]" />
        {children}
      </section>
      <AuthVisual />
    </main>
  );
}
