export default function TopBar() {
  return (
    <div className="flex justify-between items-center mb-6">
      <button className="text-pink-600 font-medium hover:underline">
        ← Back to assignment
      </button>

      <button className="border border-pink-400 text-pink-500 px-4 py-1 rounded-full text-sm font-medium mr-10">
        Student View
      </button>
    </div>
  );
}
