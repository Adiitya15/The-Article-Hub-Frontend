import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- helpers ---------- */
const isImageMime = (mime = "") =>
  mime.startsWith("image/") && (mime.includes("jpeg") || mime.includes("png"));

const schema = yup.object({
  title: yup.string().trim().required("Title is required"),
  content: yup.string().trim().required("Content is required"),
  imageFile: yup
    .mixed()
    .test("fileType", "Only JPG or PNG allowed", (value) => {
      if (!value || value.length === 0) return true;
      const f = value[0];
      return f?.type && isImageMime(f.type);
    }),
});

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------- preview ---------- */
  const [previewUrl, setPreviewUrl] = useState(null);
  const [serverImageUrl, setServerImageUrl] = useState(null);

  /* ---------- axios ---------- */
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: `${backendUrl}/api` });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  const GET_ARTICLE_PATH = `/article/Articles/${id}`;
  const UPDATE_ARTICLE_PATH = `/article/articles/${id}`;

  /* ---------- RHF ---------- */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      imageFile: undefined,
    },
  });

  const fileInputRef = useRef(null);
  const watchFile = watch("imageFile");

  /* ---------- load article ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(GET_ARTICLE_PATH);
        const payload = Array.isArray(data?.data) ? data.data[0] : data?.data;

        if (!payload) {
          toast.error("Article not found");
          navigate("/articles");
          return;
        }

        setValue("title", payload.title || "");
        setValue("content", payload.content || "");

        if (payload.imageUrl) {
          setServerImageUrl(
            payload.imageUrl.startsWith("http")
              ? payload.imageUrl
              : `${backendUrl}${payload.imageUrl}`
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
        navigate("/articles");
      }
    })();
  }, [api, id, backendUrl, navigate, setValue]);

  /* ---------- watch file & preview ---------- */
  useEffect(() => {
    const file = watchFile?.[0];

    if (file && isImageMime(file.type)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [watchFile]);

  /* ---------- submit ---------- */
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

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-2 py-1 text-xs rounded border"
          >
            ←
          </button>
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
            <label className="text-sm font-medium">Title</label>
            <input
              {...register("title")}
              className="w-full mt-1 border rounded px-3 py-2"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              {...register("content")}
              rows={5}
              className="w-full mt-1 border rounded px-3 py-2 resize-none"
            />
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Image */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Replace cover image (optional)
            </label>

            {!previewUrl && serverImageUrl && (
              <img
                src={serverImageUrl}
                alt="Current"
                className="w-32 h-32 object-cover rounded"
              />
            )}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
            )}

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              {...register("imageFile")}
              ref={(el) => {
                register("imageFile").ref(el);
                fileInputRef.current = el;
              }}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 text-xs border rounded"
              >
                Upload
              </button>

              {watchFile?.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setValue("imageFile", undefined, { shouldDirty: true });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {errors.imageFile && (
              <p className="text-xs text-red-500">{errors.imageFile.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700 text-white rounded"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
