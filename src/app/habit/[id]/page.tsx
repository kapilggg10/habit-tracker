import { HabitTrackerShell } from "@/components/HabitTrackerShell";

export function generateStaticParams() {
  return []
}

export default function HabitPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <HabitTrackerShell habitId={id} />
      </div>
    </div>
  );
}

