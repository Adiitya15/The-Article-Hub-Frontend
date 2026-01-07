import React, { useEffect, useRef, useState, useCallback } from "react";
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

const LIMIT = 9; // Changed from 1 to 9 for 3x3 grid

const Articles = ({ status }) => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  
  // Refs for intersection observer
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const controllerRef = useRef(null);

  /* ================= FETCH ARTICLES ================= */

  const fetchArticles = useCallback(async (pageNum) => {
    if (loading) return;

    try {
      setLoading(true);

      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      console.log('🔍 Fetching articles:', { pageNum, limit: LIMIT, search: debouncedSearch, status });

      const { data } = await axiosInstance.get("/article/allArticles", {
        params: { page: pageNum, limit: LIMIT, search: debouncedSearch, status },
        signal: controller.signal,
      });
      console.log('------->>', data)
      const newArticles = data?.data?.[0].items ?? [];
      const total = data?.data?.[0]?.total ?? 0;

      console.log('📦 Received:', { 
        pageNum, 
        newArticlesCount: newArticles.length, 
        total,
        totalPages: Math.ceil(total / LIMIT)
      });

      setArticles(prev => {
        // Prevent duplicates
        const existingIds = new Set(prev.map(a => a._id));
        const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a._id));
        console.log('✅ Adding articles:', { 
          prevCount: prev.length, 
          newCount: uniqueNewArticles.length,
          totalAfter: prev.length + uniqueNewArticles.length 
        });
        return [...prev, ...uniqueNewArticles];
      });

      // Check if there are more pages
      if (newArticles.length < LIMIT) {
        console.log('🛑 No more articles (received less than limit)');
        setHasMore(false);
      } else {
        const totalPages = Math.ceil(total / LIMIT);
        const hasMorePages = pageNum < totalPages;
        console.log('📄 Has more?', { pageNum, totalPages, hasMore: hasMorePages });
        setHasMore(hasMorePages);
      }

    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      console.error(err);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]); // Removed 'loading' from dependencies

  /* ================= INITIAL LOAD ================= */

  // Initial load - runs when search or status changes
  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1);
  }, [debouncedSearch, status]); // Removed fetchArticles from dependencies

  /* ================= INTERSECTION OBSERVER ================= */

  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: null, // viewport
      rootMargin: "200px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchArticles(nextPage);
          return nextPage;
        });
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, fetchArticles]);

  /* ================= HANDLERS ================= */

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
      
      <div className="w-full">
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-2xl bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Articles Grid */}
          {articles.length === 0 && !loading ? (
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

          {/* Loading Skeleton */}
          {loading && articles.length === 0 && (
            <ul
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              {Array.from({ length: LIMIT }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </ul>
          )}

          {/* INTERSECTION OBSERVER TARGET */}
          {hasMore && articles.length > 0 && (
            <div
              ref={loadMoreRef}
              className="mt-8 py-12 flex items-center justify-center"
            >
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading more articles...</span>
                </div>
              )}
            </div>
          )}

          {/* END INDICATOR */}
          {!hasMore && articles.length > 0 && (
            <div className="mt-8 py-8 text-center text-gray-400 dark:text-gray-500">
              <p>You've reached the end</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Articles;