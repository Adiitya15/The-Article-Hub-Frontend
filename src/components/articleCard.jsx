import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
 const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const DEFAULT_ARTICLE_IMAGE = "/article-default.png";


export default function ArticleCard({
  article,
  canManage,      // boolean from parent
  onDelete,       // (id) => Promise<void>
  status,         // "draft" | "published"
  onPublish,      // (id) => Promise<void>
  publishing,     // boolean for this card
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);

 
 const imgSrc = useMemo(() => {
  const url = article?.imageUrl;

  if (
    !url ||
    typeof url !== "string" ||
    url.trim() === "" ||
    url === "no-image.png" ||          // 👈 ADD THIS
    url === "/no-image.png"
  ) {
    return DEFAULT_ARTICLE_IMAGE;
  }

  return url.startsWith("http")
    ? url
    : `${backendUrl}${url}`;
}, [article?.imageUrl]);

  // Close kebab on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const confirmDelete = async () => {
    setOpen(false);
    const result = await Swal.fire({
      title: "Delete this article?",
      text: "This action cannot be undone.",
      background: "#0f172a",
      color: "#e5e7eb",
      width: "25rem",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
      focusCancel: true,
      customClass: {
        popup: "rounded-xl shadow-lg border border-gray-700",
        title: "text-lg font-semibold text-gray-100",
        htmlContainer: "text-sm text-gray-300",
        confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
        cancelButton: "px-4 py-2 rounded-md text-sm font-medium",
      },
    });
    if (!result.isConfirmed) return;

    try {
      await onDelete(article._id);
      await Swal.fire({
        title: "Deleted",
        text: "The article has been removed.",
        timer: 1300,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e5e7eb",
        width: "22rem",
        customClass: {
          popup: "rounded-xl shadow-lg border border-gray-700",
          title: "text-base font-medium text-gray-100",
          htmlContainer: "text-sm text-gray-300",
        },
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not delete the article. Please try again.",
      });
    }
  };

  const full = article?.content || "";

  return (
    <li className="relative flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800">
      {/* Image + kebab */}
      
        <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden rounded-md">
          <img
            src={imgSrc||DEFAULT_ARTICLE_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover"
             onError={(e) => {
    e.currentTarget.onerror = null; // prevent loop
    e.currentTarget.src = DEFAULT_ARTICLE_IMAGE;
  }}
          />

          {canManage && (
            <div className="absolute top-2 right-2 z-20" ref={menuRef}>
              <button
                onClick={() => setOpen((s) => !s)}
                aria-label="Article actions"
                className="w-7 h-7 rounded-full grid place-items-center bg-black/45 hover:bg-black/60 text-white backdrop-blur-sm transition"
              >
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
      

     
      

      {/* Body */}
      <div className="flex flex-col flex-grow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
          {article.title}
        </h2>

        <div className="relative">
          <div
            className={[
              "text-gray-600 dark:text-gray-300 text-sm pr-1 h-24",
              expanded ? "overflow-y-auto" : "overflow-hidden line-clamp-4",
            ].join(" ")}
          >
            {full}
          </div>
          {!expanded && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
          )}
        </div>

        <div className="mt-1">
          <Link to={`/articles/${article._id}`} className="text-blue-600 hover:underline dark:text-blue-400">
            View More
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200" aria-hidden="true">
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.333 0-10 1.667-10 5v1h20v-1c0-3.333-6.667-5-10-5z" />
            </svg>
          </span>

          <span>
            By{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {article.author?.firstName || article.authorName || "Unknown"}{" "}
              {article.author?.lastName || article.authorName || "Unknown"}
            </span>{" "}
            •{" "}
            {new Date(article.createdAt).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>

          {/* Publish button only on Drafts and if user can manage */}
          {status === "draft" && canManage && (
            <button
              onClick={() => onPublish(article._id)}
              disabled={publishing}
              className="ml-2 px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
