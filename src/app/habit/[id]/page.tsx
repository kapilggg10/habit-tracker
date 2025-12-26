import { HabitTrackerShell } from "@/components/HabitTrackerShell";

interface HabitPageProps {
  params: Promise<{ id: string }>;
}

export default async function HabitPage({ params }: HabitPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <HabitTrackerShell habitId={id} />
      </div>
    </div>
  );
}

