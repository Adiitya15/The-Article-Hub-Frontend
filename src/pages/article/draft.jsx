// src/pages/article/draft.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- Debounce Hook ---------- */
function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Drafts() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [drafts, setDrafts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // DYNAMIC LIMIT
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const controllerRef = useRef(null); // store abort controller

  const totalPages = Math.ceil(total / limit);

  /* ---------- Axios Instance ---------- */
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

  const makeImgSrc = (url) =>
    url ? (url.startsWith("http") ? url : `${backendUrl}${url}`) : null;

  /* ---------- Fetch Drafts ---------- */
  const fetchDrafts = async (signal) => {
    try {
      setLoading(true);
      const { data } = await api.get("/allArticles", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status: "draft",
        },
        signal,
      });

      const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;
      setDrafts(payload?.items || []);
      setTotal(payload?.total || 0);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      console.error(err);
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Main Effect ---------- */
  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchDrafts(controller.signal);

    return () => controller.abort();
  }, [page, debouncedSearch, limit]); // limit added

  /* ---------- SweetAlert Helpers ---------- */
  const confirmDialog = (title, text, confirmText = "Confirm", color = "#10b981") =>
    Swal.fire({
      title,
      text,
      background: "#0f172a",
      color: "#e5e7eb",
      width: "25rem",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      confirmButtonColor: color,
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

  const successToast = (title, text) =>
    Swal.fire({
      title,
      text,
      timer: 1200,
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

  /* ---------- Delete ---------- */
  const deleteDraft = async (id) => {
    const result = await confirmDialog("Delete this draft?", "This action cannot be undone.", "Delete", "#dc2626");
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/articles/${id}`);
      await successToast("Deleted", "The draft has been removed.");
      setDrafts((prev) => prev.filter((x) => x._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      fetchDrafts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete draft");
    }
  };

  /* ---------- Publish ---------- */
  const publishDraft = async (id) => {
    const result = await confirmDialog(
      "Publish this draft?",
      "It will become visible to everyone.",
      "Publish"
    );
    if (!result.isConfirmed) return;

    try {
      const fd = new FormData();
      fd.append("status", "published");

      await api.put(`/articles/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await successToast("Published", "Your draft is now public.");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish draft");
    }
  };

  /* ----------- UI ---------- */
  const canCreate = user?.role === "user" || user?.role === "admin";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 
                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Drafts</h1>
          </div>

          {canCreate && (
            <Link
              to="/articles/new"
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md 
                text-white bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              + New Article
            </Link>
          )}
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
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
              focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>

        {/* Loading / Empty */}
        {loading && <div className="text-center text-gray-600 dark:text-gray-300">Loading…</div>}
        {!loading && drafts.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">No drafts found.</div>
        )}

        {/* Draft Cards */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((d) => {
            const imgSrc = makeImgSrc(d.imageUrl);
            return (
              <li
                key={d._id}
                className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 
                  shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800"
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
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full 
                    bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 
                    border border-yellow-200 dark:border-yellow-700"
                  >
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
                  Last updated: {new Date(d.updatedAt).toLocaleString()}
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/articles/${d._id}/edit`)}
                      className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 
                        hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDraft(d._id)}
                      className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => publishDraft(d._id)}
                    className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Publish
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ---------------- Pagination (Same as Articles) ---------------- */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 
                dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-500 
                transition-all duration-200 shadow-sm"
            >
              Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`px-3 py-1 rounded-md text-sm transition
                  ${
                    page === index + 1
                      ? "text-white bg-gray-700"
                      : "hover:bg-gray-600 bg-gray-800 text-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 
                dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-500 
                transition-all duration-200 shadow-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Limit Dropdown */}
        
        <div className="flex items-center gap-2 mt-6">
          <label className="text-sm text-gray-300">Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded-md border border-gray-600 
              focus:outline-none focus:ring-0"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </section>
  );
}
