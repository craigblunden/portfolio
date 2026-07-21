import { ResumePage } from "@/features/resume/components/ResumePage";

export const metadata = {
  // Root layout appends "· Craig Blunden" via the title template.
  title: "Resume",
  description:
    "Full-stack engineer with 13+ years shipping web, mobile and backend product. Currently at Repeat.gg (Sony).",
};

export default function Resume() {
  return <ResumePage />;
}
