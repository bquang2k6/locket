import React from "react";

// Enhanced DonateHistory component with real data
const DonateHistory = () => {
  const donations = [
    {
        "id": "7ae05d05-6f28-4e05-8fbd-df371e7f8a02",
        "donorname": "Quang",
        "amount": 100000,
        "date": "2025-06-08T13:02:11",
        "message": "Tự donate cho chính mình",
        "created_at": "2025-06-08T13:02:11+00:00"
    },
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
          <span className="text-pink-500 animate-bounce text-4xl">🎁</span>
          Lịch sử ủng hộ
          <span className="text-red-500 animate-pulse text-4xl">❤️</span>
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
      </div>

      {donations.length > 0 ? (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div 
              key={donation.id} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/90"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {donation.donorname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{donation.donorname}</h4>
                      <p className="text-sm text-gray-500">{formatDate(donation.date)}</p>
                    </div>
                  </div>
                  
                  {donation.message && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mt-3 border-l-4 border-purple-400">
                      <p className="text-gray-700 italic">"{donation.message}"</p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-3 shadow-md">
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatAmount(donation.amount)}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">Ủng hộ</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Total section */}
          <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Tổng số tiền đã nhận được:</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatAmount(donations.reduce((total, donation) => total + donation.amount, 0))}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-red-500 animate-pulse text-xl">❤️</span>
                <span className="text-gray-600 font-medium">Cảm ơn {donations.length} người ủng hộ!</span>
                <span className="text-yellow-500 animate-bounce text-xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-4xl">🎁</span>
          </div>
          <p className="text-gray-500 text-lg">Chưa có ai ủng hộ dự án này</p>
          <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên ủng hộ nhé! 💖</p>
        </div>
      )}
    </div>
  );
};

const DonationInfo = () => {
  // Mock data để demo
  const BankAccount = "0889075231";
  const BankName = "MB Bank";
  const BankAccountName = "Phạm Bá Quang";

  return {
    BankAccount,
    BankName,
    BankAccountName,
  }
}

const AboutMe = () => {
  const bankinfor = DonationInfo();
  
  return (
    <div className="relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
        <div 
          className="absolute -bottom-8 -left-4 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"
          style={{animationDelay: '2s'}}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300 to-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"
          style={{animationDelay: '4s'}}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="h-20"></div>
        
        <div className="min-h-screen flex flex-col px-6 items-center">
          {/* Enhanced Profile Section */}
          <div className="flex flex-col items-center mb-12 group">
            <div className="relative mb-8">
              {/* Glowing ring effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full animate-spin opacity-75 blur-sm"
                style={{animationDuration: '3s'}}
              ></div>
              <div 
                className="absolute inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-spin opacity-50 blur-sm"
                style={{animationDuration: '2s', animationDirection: 'reverse'}}
              ></div>
              
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white shadow-2xl transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 z-10 overflow-hidden">
                <img 
                  src="https://raw.githubusercontent.com/bquang2k6/locket/refs/heads/main/public/avata.jpg?token=GHSAT0AAAAAAC6TQB4HR6TWYGZR43LJP6BS2CRVE5Q" 
                  alt="Phạm Bá Quang" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
              <div 
                className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                style={{animationDelay: '0.5s'}}
              >
                <span className="text-white text-sm">⭐</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center mb-4 transform transition-all duration-500 hover:scale-105 animate-pulse">
              Phạm Bá Quang
            </h1>
            <div className="flex items-center gap-2 text-lg md:text-xl text-gray-600 font-medium">
              <span className="animate-bounce">🎵</span>
              <span>I love Music</span>
              <span className="animate-bounce" style={{animationDelay: '0.5s'}}>✨</span>
            </div>
            
            {/* Floating tech icons */}
            <div className="flex gap-4 mt-6 opacity-60">
              <div className="animate-bounce text-2xl" style={{animationDelay: '0.2s'}}>
                ⚛️
              </div>
              <div className="animate-bounce text-2xl" style={{animationDelay: '0.4s'}}>
                🎨
              </div>
              <div className="animate-bounce text-2xl" style={{animationDelay: '0.6s'}}>
                📗
              </div>
              <div className="animate-bounce text-2xl" style={{animationDelay: '0.8s'}}>
                ▲
              </div>
            </div>
          </div>

          {/* Enhanced Support Card */}
          <div className="w-full max-w-6xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-12 relative overflow-hidden border border-white/20 transform transition-all duration-700 hover:shadow-3xl hover:scale-[1.02] hover:bg-white/90">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/30 to-blue-100/30 opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="animate-bounce">
                    <span className="text-amber-500 text-4xl">☕</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Hỗ trợ dự án này
                  </h2>
                  <div className="animate-pulse">
                    <span className="text-red-500 text-4xl">❤️</span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">Mỗi sự ủng hộ của bạn đều có ý nghĩa đặc biệt! 💖</p>
                
                {/* Decorative line */}
                <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="flex flex-col xl:flex-row gap-10 items-center">
                {/* Enhanced QR Code Section */}
                <div className="w-full xl:w-2/5 flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl w-80 h-80 flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
                      <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-6xl"><img src="https://raw.githubusercontent.com/bquang2k6/locket/refs/heads/main/public/qr.png?token=GHSAT0AAAAAAC6TQB4HN3K5U7D6QL464UMA2CRVD3Q"></img></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 shadow-lg">
                    <p className="text-amber-700 font-bold text-xl flex items-center gap-3 justify-center">
                      <span className="animate-bounce text-2xl">☕</span>
                      Buy me a coffee
                      <span className="animate-bounce text-2xl" style={{animationDelay: '0.5s'}}>☕</span>
                    </p>
                    <p className="text-sm text-amber-600 mt-2 font-medium">Quét mã QR để ủng hộ nhanh chóng</p>
                  </div>
                </div>

                {/* Enhanced Bank Info Section */}
                <div className="w-full xl:w-3/5">
                  <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                      <span className="text-3xl">💳</span>
                      Thông tin chuyển khoản
                      <span className="text-purple-500 animate-pulse text-3xl">✨</span>
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:bg-white/95 hover:scale-[1.02] hover:shadow-lg border border-purple-100">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">📱</span>
                          <p className="font-bold text-gray-700 text-lg">Số tài khoản:</p>
                        </div>
                        <p className="text-xl font-mono text-purple-700 font-bold tracking-wider bg-purple-50 rounded-lg p-3">
                          {bankinfor.BankAccount}
                        </p>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:bg-white/95 hover:scale-[1.02] hover:shadow-lg border border-pink-100">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">👤</span>
                          <p className="font-bold text-gray-700 text-lg">Tên tài khoản:</p>
                        </div>
                        <p className="text-xl text-pink-700 font-bold bg-pink-50 rounded-lg p-3">
                          {bankinfor.BankAccountName}
                        </p>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:bg-white/95 hover:scale-[1.02] hover:shadow-lg border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">🏦</span>
                          <p className="font-bold text-gray-700 text-lg">Ngân hàng:</p>
                        </div>
                        <p className="text-xl text-blue-700 font-bold bg-blue-50 rounded-lg p-3">
                          {bankinfor.BankName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-2xl border-l-4 border-purple-400 shadow-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 mt-1 animate-bounce text-xl">🎁</span>
                        <div>
                          <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            ✨ Cảm ơn bạn rất nhiều!
                            <span className="text-red-500 animate-pulse">❤️</span>
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Sự ủng hộ của bạn giúp duy trì và phát triển dự án này. 
                            Mỗi đóng góp, dù nhỏ hay lớn, đều có ý nghĩa đặc biệt với chúng tôi! 💖
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decoration elements */}
            <div className="absolute top-10 left-10 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-30"></div>
            <div 
              className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-30"
              style={{animationDelay: '1s'}}
            ></div>
            <div 
              className="absolute bottom-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-30"
              style={{animationDelay: '2s'}}
            ></div>
          </div>

          {/* Enhanced Donate History Section */}
          <div className="w-full max-w-5xl mb-12">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-2xl">
              <DonateHistory />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AboutMe;