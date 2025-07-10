const MoreInfo = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">More Info</h2>
        <p className="text-gray-700 mb-6">More info is coming soon...</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MoreInfo;
