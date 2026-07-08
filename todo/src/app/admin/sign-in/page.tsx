import { AdminSignIn } from "@/features/auth/components/AdminSignIn";

export default function AdminSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0d12] px-4 font-mono text-[#e9eef5]">
      <div className="max-w-md rounded-xl border border-[#232b36] bg-[#0e1218] p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
          admin
        </p>
        <h1 className="mb-3 text-2xl font-extrabold tracking-[-0.05em]">
          Content management sign in
          <span className="text-[#f0805c]">.</span>
        </h1>
        <p className="mb-5 text-sm leading-6 text-[#8b97a7]">
          Google sign-in is restricted to the configured admin account.
        </p>
        <AdminSignIn />
      </div>
    </div>
  );
}
