// src/pages/article/EditArticle.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // shows existing OR new file preview

  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);

  // axios instance
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: `${backendUrl}/api` });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  // Endpoints
  const GET_ARTICLE_PATH = `/article/Articles/${id}`;    // GET one
  const UPDATE_ARTICLE_PATH = `/article/articles/${id}`;  // PUT update

  // Load existing article
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadingArticle(true);
        const { data } = await api.get(GET_ARTICLE_PATH);
        const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;

        if (!payload) {
          toast.error("Article not found");
          navigate("/articles");
          return;
        }

        if (!cancelled) {
          setTitle(payload.title || "");
          setContent(payload.content || "");
          // ✅ Build absolute URL for existing server image
          if (payload.imageUrl) {
            const full =
              payload.imageUrl.startsWith("http")
                ? payload.imageUrl
                : `${backendUrl}${payload.imageUrl}`;
            setImagePreview(full);
          } else {
            setImagePreview(null);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
        navigate("/articles");
      } finally {
        if (!cancelled) setLoadingArticle(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api, GET_ARTICLE_PATH, navigate, backendUrl]);

  // Image preview (replace server image with local blob when file picked)
  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      // revoke previous blob if any
      setImagePreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setImagePreview(null);
    }
  };

  // Submit update (title/content/image only — no status)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!content.trim()) return toast.error("Content is required");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      if (imageFile) fd.append("imageFile", imageFile); // backend uses multer.single("imageFile")

      await api.put(UPDATE_ARTICLE_PATH, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Article updated");
      setTimeout(() => navigate(`/articles`), 500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update article");
    } finally {
      setLoading(false);
    }
  };

  if (loadingArticle) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10 text-gray-600 dark:text-gray-200">
          Loading article…
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Article
          </h1>
          <Link
            to="/articles"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Articles
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter title"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Write your article content here…"
              required
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 rounded-md max-h-56 object-cover border dark:border-gray-600"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
