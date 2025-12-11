import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ArticleCard({ article, canManage, onDelete }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);

  // Build a safe absolute image URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const imgSrc = useMemo(() => {
    const url = article?.imageUrl || "";
    if (!url) return null;
    return url.startsWith("http") ? url : `${backendUrl}${url}`;
  }, [article?.imageUrl, backendUrl]);

  // Close kebab menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const confirmDelete = async () => {
    setOpen(false);
    if (!window.confirm("Delete this article?")) return;
    await onDelete(article._id);
  };

  // Content preview
  const full = article?.content || "";

  return (
    <li className="relative flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800">
      {/* ===== Image + kebab ===== */}
      {imgSrc && (
        <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden rounded-md">
          <img
            src={imgSrc}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />

          {canManage && (
            <div className="absolute top-2 right-2 z-20" ref={menuRef}>
              <button
                onClick={() => setOpen((s) => !s)}
                aria-label="Article actions"
                className="w-7 h-7 rounded-full grid place-items-center bg-black/45 hover:bg-black/60 text-white backdrop-blur-sm transition"
              >
                {/* small vertical dots icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-30">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                    onClick={() => {
                      setOpen(false);
                      navigate(`/articles/${article._id}/edit`);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* If no image, show kebab above title */}
      {!imgSrc && canManage && (
        <div className="ml-auto self-end -mt-1 mb-2 relative z-10" ref={menuRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Article actions"
            className="w-7 h-7 rounded-full grid place-items-center hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-600 dark:text-gray-300">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-30">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                onClick={() => {
                  setOpen(false);
                  navigate(`/articles/${article._id}/edit`);
                }}
              >
                Edit
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== Text & controls ===== */}
      <div className="flex flex-col flex-grow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
          {article.title}
        </h2>

        {/* Fixed-height content box => expanding won't change card height */}
        <div className="relative">
          <div
            className={[
              "text-gray-600 dark:text-gray-300 text-sm pr-1 h-24", // fixed height
              expanded ? "overflow-y-auto" : "overflow-hidden line-clamp-4",
            ].join(" ")}
          >
            {full}
          </div>

          {/* Fade at bottom only when collapsed */}
          {!expanded && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
          )}
        </div>

        {/* View more/less — small area, doesn’t affect siblings */}
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            {expanded ? "View less" : "View more"}
          </button>
        </div>

        {/* Footer pinned to bottom so cards align */}
        <div className="mt-auto pt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            By {article.authorId?.firstName || "Unknown"} •{" "}
            {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ""}
          </div>

          <div className="flex justify-between items-center">
            <Link
              to={`/articles/${article._id}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
