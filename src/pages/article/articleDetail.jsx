import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  confirmDelete,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";


const DEFAULT_IMAGE = "/article-default.png";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ===========================
     Axios instance
  ============================ */
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

  const GET_BY_ID = `/article/Articles/${id}`;
  const DELETE_BY_ID = `/article/articles/${id}`;

  /* ===========================
     Load article
  ============================ */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get(GET_BY_ID);
        const payload = Array.isArray(data?.data)
          ? data.data[0]
          : data?.data;

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

  /* ===========================
     Permissions
  ============================ */
  const isAdmin = user?.role === "admin";
  const userId = user?._id || user?.id;
  const articleAuthorId = article?.authorId?._id || article?.authorId;

  const isAuthor =
    userId && articleAuthorId && String(userId) === String(articleAuthorId);

  const canDelete = isAdmin || isAuthor;
  const canEdit = isAuthor;

  /* ===========================
     Image resolver
  ============================ */
  const displayImageUrl = useMemo(() => {
    // 1️⃣ No image or default image → FRONTEND public
    if (!article?.imageUrl || article.imageUrl === DEFAULT_IMAGE) {
      return DEFAULT_IMAGE; // "/article-default.png"
    }

    // 2️⃣ Absolute URL (CDN, etc.)
    if (article.imageUrl.startsWith("http")) {
      return article.imageUrl;
    }

    // 3️⃣ Custom image from backend
    return `${backendUrl}${article.imageUrl}`;
  }, [article, backendUrl]);
  /* ===========================
     Delete handler
  ============================ */
  const confirmAndDelete = async () => {
  if (!canDelete) return;

  const result = await confirmDelete({
    title: "Delete this article?",
    text: "This action cannot be undone.",
    confirmText: "Yes, delete it",
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(DELETE_BY_ID);

    await showSuccess({
      title: "Deleted",
      text: "The article has been removed.",
    });

    navigate("/articles");
  } catch (err) {
    console.error(err);

    await showError({
      title: "Failed",
      text: "Could not delete the article.",
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

  /* ===========================
     Render
  ============================ */
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                to={`/articles/${article._id}/edit`}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="px-3 py-1.5 text-sm rounded-md text-blue-600 hover:underline"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Image */}
        <img
          src={displayImageUrl}
          alt={article.title}
          className="rounded-lg w-full max-h-[420px] object-cover mb-6 border border-gray-200 dark:border-gray-700"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />

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
