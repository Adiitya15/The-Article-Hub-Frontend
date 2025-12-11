import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateArticle() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: `${backendUrl}/api` });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  const CREATE_PATH = "/article/createArticle";

  // image preview
  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setImagePreview(null);
    }
  };

  // Reusable function for both save/publish
  const submit = async (status) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content.trim()) return toast.error("Content is required");

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      fd.append("status", status); // backend will accept 'draft' or 'published'
      if (imageFile) fd.append("imageFile", imageFile);

      await api.post(CREATE_PATH, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (status === "draft") {
        toast.success("Draft saved successfully!");
        setTimeout(() => navigate("/drafts"), 600);
      } else {
        toast.success("Article published!");
        setTimeout(() => navigate("/articles"), 600);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save article");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Article
          </h1>
          <Link
            to="/articles"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Articles
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit("draft"); // default save as draft
          }}
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
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                         focus:ring-blue-500 focus:border-blue-500 px-3 py-2 
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                         focus:ring-blue-500 focus:border-blue-500 px-3 py-2 
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg 
                         cursor-pointer bg-gray-50 dark:text-gray-300 
                         dark:bg-gray-700 dark:border-gray-600"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 rounded-md max-h-56 object-cover border dark:border-gray-600"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 
                         disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => submit("published")}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 
                         disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-gray-300 
                         dark:border-gray-700 text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
