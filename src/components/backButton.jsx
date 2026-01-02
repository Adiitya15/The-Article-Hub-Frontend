import { useNavigate } from "react-router-dom";
import { SlArrowLeft } from "react-icons/sl";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="
        inline-flex items-center justify-center
        h-10 w-10
        rounded-full
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
        hover:shadow-md
        active:scale-95
        transition-all duration-200

        focus:outline-none
        focus:ring-2
        focus:ring-gray-400 dark:focus:ring-gray-600
      "
    >
      <SlArrowLeft className="text-lg" />
    </button>
  );
}
