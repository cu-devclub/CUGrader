export default function Header() {
  return (
    <div className="bg-primary rounded-xl ml-25 mr-25 pl-10">
      <div className="bg-white shadow-sm pl-5 mb-6 flex justify-between  border border-gray">
        <div className="w-5/6 mt-5 mb-5">
          <h1 className="text-4xl font-medium mb-2">Lab 1: Arrays</h1>
          <div className="flex gap-4 text-sm text-gray-500 mb-2">
            <span>4 Aug 2025 09:30</span>
            <span>to</span>
            <span>4 Aug 2025 09:30</span>
          </div>
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded border border-green-800">
            Publishing
          </span>
        </div>

        <div className="w-1/6 border border-gray flex justify-center items-center flex-col">
          <p className="text-3xL font-medium text-black">Submitted</p>
          <p className="text-3xl font-medium">0/30</p>
        </div>
      </div>
    </div>
  );
}
