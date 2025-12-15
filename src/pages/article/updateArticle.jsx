  // src/pages/article/EditArticle.jsx
  import React, { useEffect, useMemo, useRef, useState } from "react";
  import { Link, useNavigate, useParams } from "react-router-dom";
  import axios from "axios";
  import { useForm } from "react-hook-form";
  import { yupResolver } from "@hookform/resolvers/yup";
  import * as yup from "yup";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  // ---------- helpers ----------
  const isImageMime = (mime = "") =>
    mime.startsWith("image/") && (mime.includes("jpeg") || mime.includes("png"));

  const schema = yup.object({
    title: yup.string().trim().required("Title is required"),
    content: yup.string().trim().required("Content is required"),
    imageFile: yup
      .mixed()
      .test("fileType", "Only JPG, PNG or PDF allowed", (value) => {
        if (!value || value.length === 0) return true; // optional
        const f = value[0];
        if (!f?.type) return false;
        return isImageMime(f.type) || f.type === "application/pdf";
      }),
  });

  export default function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

    const GET_ARTICLE_PATH = `/article/Articles/${id}`;   // GET one
    const UPDATE_ARTICLE_PATH = `/article/articles/${id}`; // PUT update

    // RHF
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors, isSubmitting },
    } = useForm({
      resolver: yupResolver(schema),
      defaultValues: { title: "", content: "", imageFile: undefined },
    });

    // ---- merge RHF ref with our local ref for auto-grow ----
    const contentRef = useRef(null);
    const contentReg = register("content");
    const attachContentRef = (el) => {
      contentReg.ref(el);       // keep RHF control
      contentRef.current = el;  // keep local ref
    };

    const fileInputRef = useRef(null);

    // server file preview (image or pdf)
    const [serverFileUrl, setServerFileUrl] = useState(null);
    const [serverIsPdf, setServerIsPdf] = useState(false);

    // local preview (only for images selected locally)
    const [localPreview, setLocalPreview] = useState(null);

    // -------- load existing article --------
    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const { data } = await api.get(GET_ARTICLE_PATH);
          const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;

          if (!payload) {
            toast.error("Article not found");
            navigate("/articles");
            return;
          }
          if (cancelled) return;

          setValue("title", payload.title || "");
          setValue("content", payload.content || "");

          // grow the textarea after RHF sets the value
          requestAnimationFrame(() => {
            if (contentRef.current) {
              contentRef.current.style.height = "auto";
              contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
            }
          });

          if (payload.imageUrl) {
            const url = payload.imageUrl.startsWith("http")
              ? payload.imageUrl
              : `${backendUrl}${payload.imageUrl}`;
            setServerFileUrl(url);
            setServerIsPdf(url.toLowerCase().endsWith(".pdf"));
          } else {
            setServerFileUrl(null);
            setServerIsPdf(false);
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to load article");
          navigate("/articles");
        }
      })();

      return () => {
        cancelled = true;
        if (localPreview && localPreview.startsWith("blob:")) {
          URL.revokeObjectURL(localPreview);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, id]);

    // watch file to produce local preview
    const watchFile = watch("imageFile");

    useEffect(() => {
      const f = watchFile?.[0];
      if (f && isImageMime(f.type)) {
        const url = URL.createObjectURL(f);
        setLocalPreview((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        if (localPreview && localPreview.startsWith("blob:")) {
          URL.revokeObjectURL(localPreview);
        }
        setLocalPreview(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchFile]);

    const onPickFile = () => fileInputRef.current?.click();

    const onSubmit = async (form) => {
      try {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("content", form.content.trim());
        if (form.imageFile && form.imageFile.length > 0) {
          fd.append("imageFile", form.imageFile[0]);
        }

        await api.put(UPDATE_ARTICLE_PATH, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Article updated");
        setTimeout(() => navigate("/articles"), 500);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update article");
      }
    };

    return (
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header: back left, centered title, link right */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-2.5 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ←
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Article
            </h1>
            
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Content (auto-grow, no scrollbar, RHF-controlled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                {...contentReg}
                ref={attachContentRef}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                rows={5}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white overflow-hidden resize-none"
                placeholder="Write your article content here…"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
              )}
            </div>

            {/* File section (no border). Button sits BELOW preview. Smaller image preview */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Replace Cover or Document{" "}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (JPG/PNG/PDF, optional)
                </span>
              </label>

              {/* Existing server preview (image or PDF) if no new local image picked */}
              {!localPreview && serverFileUrl && (
                <>
                  {serverIsPdf ? (
                    <a
                      href={serverFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View current PDF
                    </a>
                  ) : (
                    <img
                      src={serverFileUrl}
                      alt="Current"
                      className="rounded-md max-h-40 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </>
              )}

              {/* Local image preview (when a new image is chosen) */}
              {localPreview && (
                <img
                  src={localPreview}
                  alt="Preview"
                  className="rounded-md max-h-40 object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}

              {/* If a local PDF selected, show file name */}
              {watchFile &&
                watchFile.length > 0 &&
                !isImageMime(watchFile[0]?.type) && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Selected file: {watchFile[0]?.name}
                  </p>
                )}

              {/* Hidden input + tiny button below preview */}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                {...register("imageFile")}
                ref={fileInputRef}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Upload File
                </button>
                {watchFile && watchFile.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      // clear local preview & input
                      setLocalPreview((prev) => {
                        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                        return null;
                      });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                        const dt = new DataTransfer();
                        fileInputRef.current.files = dt.files;
                        const ev = new Event("change", { bubbles: true });
                        fileInputRef.current.dispatchEvent(ev);
                      }
                    }}
                    className="px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {errors.imageFile && (
                <p className="text-xs text-red-500">{errors.imageFile.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg  rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }
