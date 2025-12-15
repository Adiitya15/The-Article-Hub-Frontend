// src/components/ArticleCardSkeleton.jsx
import Skeleton from "./skeleton";

export default function ArticleCardSkeleton() {
  return (
    <li className="relative flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[16/9] mb-3" />

      {/* Title */}
      <Skeleton className="h-5 w-3/4 mb-2" />

      {/* Content lines */}
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Footer (avatar + text + optional button space) */}
      <div className="flex items-center gap-2 mt-auto">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-40" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </li>
  );
}
