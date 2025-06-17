import "./styles.css";

const AnimatedButton = () => {
  return (
    <button className="button mt-10">
      <div className="bg"></div>
      <div className="wrap">
        <div className="outline"></div>
        <div className="content">
          <span className="char state-1">
            <span data-label="J" style={{ "--i": 1 }}>J</span>
            <span data-label="o" style={{ "--i": 2 }}>o</span>
            <span data-label="i" style={{ "--i": 3 }}>i</span>
            <span data-label="n" style={{ "--i": 4 }}>n</span>
            <span data-label="T" style={{ "--i": 5 }}>T</span>
            <span data-label="o" style={{ "--i": 6 }}>o</span>
            <span data-label="d" style={{ "--i": 7 }}>d</span>
            <span data-label="a" style={{ "--i": 8 }}>a</span>
            <span data-label="y" style={{ "--i": 9 }}>y</span>
          </span>
          
          <div className="icon">
            <div></div>
          </div>
          
          <span className="char state-2">
            <span data-label="J" style={{ "--i": 1 }}>J</span>
            <span data-label="o" style={{ "--i": 2 }}>o</span>
            <span data-label="i" style={{ "--i": 3 }}>i</span>
            <span data-label="n" style={{ "--i": 4 }}>n</span>
            <span data-label="N" style={{ "--i": 5 }}>N</span>
            <span data-label="o" style={{ "--i": 6 }}>o</span>
            <span data-label="w" style={{ "--i": 7 }}>w</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default AnimatedButton;