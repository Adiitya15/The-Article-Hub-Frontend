// src/pages/articles/Articles.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArticleCard from "../../components/articleCard";
import ArticleCardSkeleton from "../../components/articleCardSkeleton";

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
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [publishingId, setPublishingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const controllerRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `${backendUrl}/api`,
      headers: { "Content-Type": "application/json" },
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  const fetchArticles = async (signal) => {
    try {
      setLoading(true);
      const { data } = await api.get("/article/allArticles", {
        params: { page, limit, search: debouncedSearch, status },
        signal,
      });
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
    // include limit so changing page size refetches
  }, [page, debouncedSearch, status, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const canCreate = user?.role === "user" || user?.role === "admin";

  const handleDelete = async (id) => {
    try {
      await api.delete(`/article/articles/${id}`);
      toast.success("Article deleted");
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      fetchArticles(controller.signal);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article");
    }
  };

  const canManage = (a) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const authorId = a.authorId?._id || a.authorId;
    return String(authorId) === String(user._id || user.id);
  };

  const handlePublish = async (id) => {
    try {
      setPublishingId(id);
      await api.patch(`/article/articles/${id}`, { status: "published" });
      toast.success("Draft published");
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      fetchArticles(controller.signal);
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish draft");
    } finally {
      setPublishingId(null);
    }
  };

  const title = status === "draft" ? "Drafts" : "Articles";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-6xl mx-auto px-6 py-8">
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
        <div className="mb-5">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()} by title or content...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>

        {/* Skeletons or content */}
        {loading ? (
          <ul
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            {Array.from({ length: limit }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </ul>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No {status === "draft" ? "drafts" : "articles"} found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        {!loading && total > 0 && (
          <>
            <div className="flex items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-500 transition-all duration-200 shadow-sm focus:outline-none focus:ring-0"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    page === index + 1 ? "text-white bg-gray-700" : "hover:bg-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-500 transition-all duration-200 shadow-sm"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-6">
              <label className="text-sm text-gray-300">Items per page:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-gray-800 text-white text-sm px-2 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Articles;
