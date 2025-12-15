// src/pages/article/articleDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Axios instance
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

  // Endpoints
  const GET_BY_ID = `/article/Articles/${id}`;
  const DELETE_BY_ID = `/article/articles/${id}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get(GET_BY_ID);
        const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;

        if (!payload) {
          toast.error("Article not found");
          navigate("/articles");
          return;
        }
        if (!cancelled) setArticle(payload);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
        navigate("/articles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api, GET_BY_ID, navigate]);

  // Permissions
  const isAdmin = user?.role === "admin";
  const userId = user?._id || user?.id;
  const articleAuthorId = article?.authorId?._id || article?.authorId;
  const isAuthor =
    userId && articleAuthorId && String(userId) === String(articleAuthorId);

  const canDelete = isAdmin || isAuthor;
  const canEdit = isAuthor;

  // SweetAlert2 themed confirm (same style as cards)
  const confirmAndDelete = async () => {
    if (!canDelete) return;

    const result = await Swal.fire({
      title: "Delete this article?",
      text: "This action cannot be undone.",
      background: "#0f172a",            // dark navy
      color: "#e5e7eb",                 // gray-200
      width: "25rem",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",    // red-600
      cancelButtonColor: "#374151",     // gray-700
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
      await api.delete(DELETE_BY_ID);

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

      navigate("/articles");
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "Failed",
        text: "Could not delete the article. Please try again.",
        background: "#0f172a",
        color: "#e5e7eb",
        width: "22rem",
        confirmButtonColor: "#374151",
        customClass: {
          popup: "rounded-xl shadow-lg border border-gray-700",
          title: "text-base font-medium text-gray-100",
          htmlContainer: "text-sm text-gray-300",
          confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
        },
      });
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-10 text-gray-700 dark:text-gray-200">
          Loading…
        </div>
      </section>
    );
  }
  if (!article) return null;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header + actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              By {article.authorId?.firstName || "Unknown"} •{" "}
              {article.createdAt
                ? new Date(article.createdAt).toLocaleDateString()
                : ""}
              {article.status && (
                <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {article.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                to={`/articles/${article._id}/edit`}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={confirmAndDelete}
                className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <Link
              to="/articles"
              className="px-3 py-1.5 text-sm rounded-md text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Cover image */}
        {article.imageUrl && (
          <img
            src={
              article.imageUrl.startsWith("http")
                ? article.imageUrl
                : `${backendUrl}${article.imageUrl}`
            }
            alt={article.title}
            className="rounded-lg w-full max-h-[420px] object-cover mb-6 border border-gray-200 dark:border-gray-700"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        {/* Content */}
        <article className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-line text-gray-800 dark:text-gray-100 leading-7">
            {article.content}
          </p>
        </article>
      </div>
    </section>
  );
}
