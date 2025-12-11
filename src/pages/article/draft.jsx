// src/pages/article/Drafts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LIMIT = 10;

export default function Drafts() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [drafts, setDrafts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // axios instance: baseURL already points to /api/article
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `${backendUrl}/api/article`,
      headers: { "Content-Type": "application/json" },
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  // build absolute URL for images
  const makeImgSrc = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${backendUrl}${url}`;
  };

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      // GET /api/article/allArticles?status=draft
      const { data } = await api.get("/allArticles", {
        params: { page, limit: LIMIT, search, status: "draft" },
      });

      // your response handler wraps payload in an array => data.data[0]
      const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;
      setDrafts(payload?.items || []);
      setTotal(payload?.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // Publish draft -> status: "published"
  const publishDraft = async (id) => {
    try {
      const fd = new FormData();
      fd.append("status", "published");

      // baseURL already has /api/article
      await api.put(`/articles/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Draft published");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish draft");
    }
  };

  const deleteDraft = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success("Draft deleted");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete draft");
    }
  };

  const canCreate = user?.role === "user" || user?.role === "admin";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Drafts
          </h1>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Link
                to="/articles/new"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800"
              >
                + New Draft
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search drafts by title or content..."
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
        {!loading && drafts.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No drafts found.
          </div>
        )}

        {/* List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((d) => {
            const imgSrc = makeImgSrc(d.imageUrl);
            return (
              <li
                key={d._id}
                className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800"
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={d.title}
                    className="rounded-md w-full h-48 object-cover mb-3"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}

                <div className="mb-2">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                    Draft
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  {d.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-2">
                  {d.content}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Last updated: {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ""}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(`/articles/${d._id}/edit`)}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => publishDraft(d._id)}
                    className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Publish
                  </button>

                  <button
                    onClick={() => deleteDraft(d._id)}
                    className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>

                  <Link
                    to={`/articles/${d._id}`}
                    className="ml-auto text-blue-600 hover:underline dark:text-blue-400 text-sm"
                  >
                    Preview
                  </Link>
                </div>
              </li>
            );
          })}
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
            <span className="text-gray-700 dark:text-gray-200">Page {page}</span>
            <button
              disabled={drafts.length < LIMIT}
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
}
