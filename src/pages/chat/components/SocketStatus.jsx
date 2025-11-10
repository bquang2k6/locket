import React from "react";

const SocketStatus = ({ isConnected }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-grid *:[grid-area:1/1]">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-ping" : "bg-red-500"
          }`}
        ></div>
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      </div>
      <span className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
        {isConnected ? "Đã kết nối" : "Mất kết nối"}
      </span>
    </div>
  );
};

export default SocketStatus;

