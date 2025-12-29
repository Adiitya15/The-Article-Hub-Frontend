import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import BackButton from "../../components/backButton";

const MAX_FILE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_IMAGE = "http://localhost:5000/uploads/no-image.png";

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  content: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),
  imageFile: yup
    .mixed()
    .test("fileType", "Only JPG, PNG", (file) => {
      if (!file || file.length === 0) return true;
      return ACCEPTED_FILE_TYPES.includes(file[0]?.type);
    })
    .test("fileSize", `File must be ≤ ${MAX_FILE_MB}MB`, (file) => {
      if (!file || file.length === 0) return true;
      return (file[0]?.size || 0) <= MAX_FILE_MB * 1024 * 1024;
    }),
});

const isImageMime = (m) =>
  m && (m.startsWith("image/jpeg") || m.startsWith("image/png"));

export default function CreateArticle() {
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [previewUrl, setPreviewUrl] = useState(null);
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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "", content: "", imageFile: undefined },
  });

  // Live preview for image files only
  const watchFile = watch("imageFile");
  useEffect(() => {
    if (watchFile && watchFile.length > 0 && isImageMime(watchFile[0]?.type)) {
      const url = URL.createObjectURL(watchFile[0]);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
      return () => URL.revokeObjectURL(url);
    } else {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [watchFile]);

  const submitWithStatus = async (form, status) => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("content", form.content.trim());
      // no dropdown; we decide based on which button was clicked:
      fd.append("status", status); // "draft" | "published"
      if (form.imageFile) {
        fd.append("imageFile", form.imageFile[0]); // field name used by multer
      }

      await api.post(CREATE_PATH, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (status === "draft") {
        toast.success("Draft saved");
        setTimeout(() => navigate("/drafts"), 500);
      } else {
        toast.success("Article published");
        setTimeout(() => navigate("/articles"), 500);
      }
      reset();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create article");
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveDraft = (data) => submitWithStatus(data, "draft");
  const onPublish = (data) => submitWithStatus(data, "published");

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex items-center gap-3 mb-6">
  <BackButton />
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Create Article
  </h1>
      </div>

        <form className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-5">
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
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              {...register("content")}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Write your article content here…"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Cover Image or Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image or Document{" "}
              <span className="text-gray-400">(optional)</span>
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              id="fileUpload"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              {...register("imageFile", {
                onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    toast.info(`Selected: ${file.name}`);
                  }
                },
              })}
            />

            {/* Custom upload button */}
            <button
              type="button"
              onClick={() => document.getElementById("fileUpload").click()}
              className="px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Upload File
            </button>
            {previewUrl && (
              <div className="mt-3 space-y-2">
                {/* Image preview */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded object-cover border dark:border-gray-600"
                />

                {/* File name + Remove button */}
                {watchFile?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Selected: {watchFile[0]?.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        reset({ ...watch(), imageFile: undefined });
                        document.getElementById("fileUpload").value = "";
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit(onSaveDraft)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit(onPublish)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </div>
        </form>
    </section>
  );
}
