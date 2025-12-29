import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="px-2.5 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 
        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      ←
    </button>
  );
}
