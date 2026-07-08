import { DashboardPage } from "@/features/dashboard/components/DashboardPage";

type HomeProps = {
  searchParams: Promise<{
    auth?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { auth } = await searchParams;

  return <DashboardPage authDenied={auth === "denied"} />;
}
