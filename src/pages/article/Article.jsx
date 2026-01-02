// src/pages/articles/Articles.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../utils/axios.interceptor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArticleCard from "../../components/articleCard";
import ArticleCardSkeleton from "../../components/articleCardSkeleton";
import {
  confirmDelete,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";

/* ---------- small hook for debouncing ---------- */
function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Articles = ({ status }) => {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(2);
  const [publishingId, setPublishingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const controllerRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchArticles = async (signal) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/article/allArticles", {
        params: { page, limit, search: debouncedSearch, status },
        signal,
      });
      console.log("array shape<<<", data);
      setArticles(data?.data?.[0]?.items ?? []);
      setTotal(data?.data?.[0]?.total ?? 0);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      console.error(err);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchArticles(controller.signal);
    return () => controller.abort();
  }, [page, debouncedSearch, status, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const canCreate = user?.role === "user" || user?.role === "admin";

  const handleDelete = async (articleId) => {
    try {
      await axiosInstance.delete(`/article/articles/${articleId}`);
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article._id !== articleId)
      );
      console.log("✅ Article deleted and removed from UI:", articleId);
    } catch (error) {
      console.error("❌ Delete failed:", error);
      throw error;
    }
  };

  const canManage = (a) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const authorId = a.authorId?._id || a.authorId;
    return String(authorId) === String(user._id || user.id);
  };

  const handlePublish = async (id) => {
    const result = await confirmDelete({
      title: "Publish this draft?",
      text: "Once published, this article will be visible to everyone.",
      confirmText: "Yes, publish it",
    });

    if (!result.isConfirmed) return;

    try {
      setPublishingId(id);
      await axiosInstance.put(`/article/articles/${id}`, { status: "published" });

      await showSuccess({
        title: "Published!",
        text: "Your article is now live.",
      });

      setArticles((prev) => prev.filter((a) => a._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));

      if (articles.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      console.error(err);
      await showError({
        title: "Publish failed",
        text: "Could not publish the article. Please try again.",
      });
    } finally {
      setPublishingId(null);
    }
  };

  const title = status === "draft" ? "Drafts" : "Articles";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Main content - with left margin for sidebar that's in parent layout */}
      <div className=" w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>

            <div className="flex items-center gap-3">
              {canCreate && status !== "draft" && (
                <Link
                  to="/articles/new"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md
                             text-white bg-gray-700 hover:bg-gray-600 
                             dark:bg-gray-600 dark:hover:bg-gray-500 
                             transition-all duration-200 shadow-sm"
                >
                  + New Article
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()} by title or content...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full max-w-2xl bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Articles Grid */}
          {loading ? (
            <ul
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              {Array.from({ length: limit }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </ul>
          ) : articles.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 py-12">
              <p className="text-lg">No {status === "draft" ? "drafts" : "articles"} found.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((a) => (
                <ArticleCard
                  key={a._id}
                  article={a}
                  canManage={canManage(a)}
                  onDelete={handleDelete}
                  status={status}
                  onPublish={handlePublish}
                  publishing={publishingId === a._id}
                />
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!loading && total > 0 && totalPages >= 1 && (
            <div className="mt-8 space-y-4">
              {/* Page Controls */}
              <div className="flex items-center justify-center gap-2">
                {/* Prev */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-4 py-2 border rounded-lg shadow-sm transition font-medium
                    ${page === 1 
                      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                    bg-white dark:bg-gray-800 dark:border-gray-700
                    text-gray-700 dark:text-gray-200`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = page === pageNum;

                    // Show first, last, current, and adjacent pages
                    const showPage = 
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      Math.abs(pageNum - page) <= 1;

                    const showEllipsis = 
                      (pageNum === 2 && page > 3) ||
                      (pageNum === totalPages - 1 && page < totalPages - 2);

                    if (!showPage && !showEllipsis) return null;
                    if (showEllipsis) return <span key={pageNum} className="px-2 text-gray-500">...</span>;

                    return (
                      <button
                        key={pageNum}
                        disabled={isActive}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-md text-sm font-medium transition
                          ${isActive
                            ? "bg-gray-700 text-white cursor-default shadow-md"
                            : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"}
                          disabled:opacity-70`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-4 py-2 border rounded-lg shadow-sm transition font-medium
                    ${page === totalPages
                      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                    bg-white dark:bg-gray-800 dark:border-gray-700
                    text-gray-700 dark:text-gray-200`}
                >
                  Next
                </button>
              </div>

              {/* Items per page */}
              <div className="flex items-center justify-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Items per page:
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Articles;