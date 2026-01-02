import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../../components/backButton";

const MAX_FILE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_IMAGE = "/article-default.png";

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

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [serverImageUrl, setServerImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [removeServerImage, setRemoveServerImage] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: `${backendUrl}/api` });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [backendUrl]);

  const GET_ARTICLE_PATH = `/article/articles/${id}`;
  const UPDATE_ARTICLE_PATH = `/article/articles/${id}`;

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

  const watchFile = watch("imageFile");

  // Load article
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

        // Only set serverImageUrl if it's NOT the default image
        if (payload.imageUrl && payload.imageUrl !== DEFAULT_IMAGE) {
          const imageUrl = payload.imageUrl.startsWith("http")
            ? payload.imageUrl
            : `${backendUrl}${payload.imageUrl}`;
          setServerImageUrl(imageUrl);
          setFileName(payload.imageUrl.split("/").pop());
        } else {
          // If it's the default image or no image, don't set serverImageUrl
          setServerImageUrl(null);
          setFileName("");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
        navigate("/articles");
      }
    })();
  }, [api, backendUrl, id, navigate, setValue]);

  // Preview selected file
  useEffect(() => {
    if (watchFile && watchFile.length > 0 && isImageMime(watchFile[0]?.type)) {
      const file = watchFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
      setFileName(file.name);
      setServerImageUrl(null); // Hide server image when new file selected
      setRemoveServerImage(false);
      return () => URL.revokeObjectURL(url);
    } else if (!watchFile || watchFile.length === 0) {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (!serverImageUrl) setFileName("");
    }
  }, [watchFile]);

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setServerImageUrl(null);
    setFileName("");
    setRemoveServerImage(true);
    setValue("imageFile", undefined);
    // Reset the file input
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (form) => {
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("content", form.content.trim());

      console.log("🆔 Updating article ID:", id);
      console.log("🔍 Submit state:", {
        removeServerImage,
        hasImageFile: form.imageFile?.length > 0,
        serverImageUrl,
        previewUrl
      });

      // LOGIC:
      // 1. If new image uploaded -> send the file
      // 2. If image was removed and no new image -> tell backend to set default
      // 3. If image exists and not changed -> don't send anything (backend keeps existing)

      // If a new image is uploaded
      if (form.imageFile && form.imageFile.length > 0) {
        console.log("✅ Uploading new image file");
        fd.append("imageFile", form.imageFile[0]);
      }
      // If user removed the image and didn't upload a new one -> set default
      else if (removeServerImage && (!form.imageFile || form.imageFile.length === 0)) {
        console.log("✅ Image removed, setting default");
        fd.append("imageAction", "set-default");
      }
      // Otherwise: keep existing image (don't send anything)

      // Log what we're sending
      console.log("📤 FormData contents:");
      for (let pair of fd.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      console.log("🌐 API endpoint:", UPDATE_ARTICLE_PATH);

      const response = await api.put(UPDATE_ARTICLE_PATH, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📥 Backend response:", response.data);

      toast.success("Article updated");
      setTimeout(() => navigate("/articles"), 500);
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to update article");
    }
  };

  const displayImage = previewUrl || serverImageUrl || DEFAULT_IMAGE;
  const hasActualImage = previewUrl || serverImageUrl;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Article
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            className="w-full px-3 py-2 rounded-lg border"
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            {...register("content")}
            className="w-full px-3 py-2 rounded-lg border"
            placeholder="Write your article content here…"
          />
          {errors.content && (
            <p className="text-xs text-red-500 mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Article Image (Optional)
          </label>

          <input
            type="file"
            id="fileUpload"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            {...register("imageFile")}
          />

          {!hasActualImage && (
            <button
              type="button"
              onClick={() => document.getElementById("fileUpload").click()}
              className="text-sm border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Upload Image
            </button>
          )}

          {errors.imageFile && (
            <p className="text-xs text-red-500 mt-1">
              {errors.imageFile.message}
            </p>
          )}

          {/* Image preview and filename */}
          {hasActualImage && (
            <div className="mt-4 flex items-start gap-4">
              <img
                src={displayImage}
                alt="Preview"
                className="w-32 h-32 rounded object-cover border border-gray-200 dark:border-gray-600"
              />

              <div className="flex flex-col justify-end h-32">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">Selected file:</span> {fileName}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition text-left"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/articles")}
            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}