// src/pages/articles/Articles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArticleCard from "../../components/articleCard"; // <-- NEW
import Navbar from "../../components/navBar";

const LIMIT = 10;

const Articles = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

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

  const fetchArticles = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/article/allArticles", {
        params: { page, limit: LIMIT, search, status: "published" },
      });

      // your current response handler returns data as an array: data.data[0]
      setArticles(data?.data?.[0]?.items ?? []);
      setTotal(data?.data?.[0]?.total ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const canCreate = user?.role === "user" || user?.role === "admin";

  // NEW: delete handler (adjust URL if your route is different)
  const handleDelete = async (id) => {
    try {
      await api.delete(`/article/articles/${id}`);
      toast.success("Article deleted");
      fetchArticles();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article");
    }
  };

  // NEW: who can manage each article (admin or owner)
  const canManage = (a) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const authorId = a.authorId?._id || a.authorId;
    return String(authorId) === String(user._id || user.id);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Articles
          </h1>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Link
                to="/articles/new"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg 
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
            placeholder="Search articles by title or content..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>

        {/* Loading / Empty */}
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            Loading…
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No articles found.
          </div>
        )}

        {/* List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              canManage={canManage(a)}
              onDelete={handleDelete}
            />
          ))}
        </ul>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-200">
              Page {page}
            </span>
            <button
              disabled={articles.length < LIMIT}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Articles;
