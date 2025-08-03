import React from 'react';
import ThemeSelector from '../../components/Theme/ThemeSelector';

const ThemePage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-base-content mb-4 mt-10">
              🎨 Tùy Chỉnh Giao Diện
            </h1>
            <p className="text-base-content/70 text-lg">
              Chọn giao diện phù hợp với phong cách của bạn
            </p>
          </div>
          
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
};

export default ThemePage; 