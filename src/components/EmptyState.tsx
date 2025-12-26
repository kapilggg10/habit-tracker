import { CreateHabitButton } from "./CreateHabitButton";

export function EmptyState() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.05),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mb-8 max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-2xl" />
            <div className="relative rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6 dark:from-blue-900/30 dark:to-purple-900/30">
              <svg
                className="h-16 w-16 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
          Start Your Journey
        </h1>
        <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">
          Every great achievement begins with a single step.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Create your first habit and begin building the life you want, one day
          at a time.
        </p>
      </div>
      <div className="relative z-10">
        <CreateHabitButton />
      </div>
    </div>
  );
}
