import PropTypes from "prop-types";

function LoadingSkeleton({ count = 10, width = "200px", height = "300px" }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-10">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{ width, height }}
          className="bg-gray-800 animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}

LoadingSkeleton.propTypes = {
  count: PropTypes.number,
  width: PropTypes.string,
  height: PropTypes.string,
};

export default LoadingSkeleton;
