function LinkDisplay({ link }) {
  return (
    <div className="text-center">
      <p className="text-gray-600 mb-4">You added a link instead of table</p>

      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 underline"
      >
        🔗 Open Link
      </a>
    </div>
  );
}

export default LinkDisplay;
