import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios.interceptor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import BackButton from "../../components/backButton";
import {
  confirmDelete,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";

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

  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const CREATE_PATH = "/article/createArticle";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "", content: "", imageFile: undefined },
  });

  const watchFile = watch("imageFile");

  useEffect(() => {
    if (watchFile && watchFile.length > 0 && isImageMime(watchFile[0]?.type)) {
      const file = watchFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
      setFileName(file.name);
      return () => URL.revokeObjectURL(url);
    } else {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFileName("");
    }
  }, [watchFile]);

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName("");
    setValue("imageFile", undefined);
    // Reset the file input
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) fileInput.value = "";
  };

  const submitWithStatus = async (form, status) => {
    try {
      setSubmitting(true);
      const fd = new FormData();

      fd.append("title", form.title.trim());
      fd.append("content", form.content.trim());
      fd.append("status", status);

      if (form.imageFile && form.imageFile.length > 0) {
        fd.append("imageFile", form.imageFile[0]);
      }

      await axiosInstance.post(CREATE_PATH, fd, {
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
      setPreviewUrl(null);
      setFileName("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create article");
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveDraft = async (data) => {
    const result = await confirmDelete({
      title: "Save this article as a draft?",
      text: "You can continue editing it later.",
      confirmText: "Yes, save draft",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await submitWithStatus(data, "draft");

      await showSuccess({
        title: "Draft saved",
        text: "Your article has been saved successfully.",
      });

      navigate("/drafts");
    } catch (err) {
      console.error(err);
      await showError({
        title: "Save failed",
        text: "Unable to save draft. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onPublish = async (data) => {
    const result = await confirmDelete({
      title: "Publish this article?",
      text: "Once published, this article will be visible to everyone.",
      confirmText: "Yes, publish it",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await submitWithStatus(data, "published");

      await showSuccess({
        title: "Published!",
        text: "Your article is now live.",
      });

      navigate("/articles");
    } catch (err) {
      console.error(err);
      await showError({
        title: "Publish failed",
        text: "Could not publish the article. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

          {!previewUrl && (
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
         {previewUrl && (
            <div className="mt-4 flex items-start gap-4">
              <img
                src={previewUrl}
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
            disabled={submitting}
            onClick={handleSubmit(onSaveDraft)}
            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit(onPublish)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}