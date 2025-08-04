import React, { useContext, useState, useEffect } from "react";
import { Settings2, Server, Eye, EyeOff, RefreshCw, Download, Smartphone } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthLocket";
import { showSuccess, showInfo } from "../../../components/Toast";
import { getCustomBackendUrl } from "../../../utils/backendConfig";
import { TbServerOff, TbServerBolt } from "react-icons/tb";

function SettingsPage() {
  const { user } = useContext(AuthContext);
  const [backendUrl, setBackendUrl] = useState("");
  const [isCustomBackend, setIsCustomBackend] = useState(false);
  const [encryptKey, setEncryptKey] = useState("");
  const [showEncryptKey, setShowEncryptKey] = useState(false);
  const [nodeStatus, setNodeStatus] = useState(null);
  const [isCheckingNode, setIsCheckingNode] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const urlRegex = /^https?:\/\/(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z]{2,})?(?::\d{1,5})?(?:\/[^\s]*)?$/;

  const measureLatency = async (url) => {
    try {
      const startTime = performance.now();
      const response = await axios.head(`${url}/keepalive`, {
        timeout: 5000
      });
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      return {
        isUp: response.status === 200,
        latency: `${latency}ms`,
        type: 'custom',
        name: 'Custom Node'
      };
    } catch (error) {
      return {
        isUp: false,
        latency: 'N/A',
        type: 'custom',
        name: 'Custom Node'
      };
    }
  };

  // Load backend settings when component mounts
  useEffect(() => {
    const savedUrl = getCustomBackendUrl();
    const savedIsCustom = localStorage.getItem("use_custom_backend") === "true";
    const savedEncryptKey = localStorage.getItem("custom_backend_encrypt_key");
    
    if (savedUrl) {
      setBackendUrl(savedUrl);
      checkNodeStatus(savedUrl);
    }
    if (savedEncryptKey) {
      setEncryptKey(savedEncryptKey);
    }
    setIsCustomBackend(savedIsCustom);
  }, []);

  // Check PWA support and installation status
  useEffect(() => {
    // Check if PWA is supported
    const checkPWASupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setSupportsPWA(isSupported);
      
      // Check if app is already installed
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      
      // Listen for beforeinstallprompt event
      const handler = (e) => {
        e.preventDefault();
        setPromptInstall(e);
        console.log('PWA install prompt available');
      };
      
      window.addEventListener('beforeinstallprompt', handler);
      
      // Check if we already have a stored prompt
      if (window.deferredPrompt) {
        setPromptInstall(window.deferredPrompt);
      }
      
      return () => window.removeEventListener('beforeinstallprompt', handler);
    };
    
    checkPWASupport();
  }, []);

  const checkNodeStatus = async (url) => {
    if (!url || !urlRegex.test(url)) {
      setNodeStatus(null);
      setLastCheckedTime(null);
      return;
    }
    setIsCheckingNode(true);
    const status = await measureLatency(url);
    setNodeStatus(status);
    setIsCheckingNode(false);
    setRefreshCountdown(10);
    setLastCheckedTime(new Date());
  };

  // Handle refresh countdown
  useEffect(() => {
    let timer;
    if (refreshCountdown > 0) {
      timer = setInterval(() => {
        setRefreshCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [refreshCountdown]);

  useEffect(() => {
    if (isCustomBackend && backendUrl) {
      checkNodeStatus(backendUrl);
    } else {
      setNodeStatus(null);
      setLastCheckedTime(null);
    }
  }, [backendUrl, isCustomBackend]);

  const handleRefresh = () => {
    if (refreshCountdown === 0 && backendUrl) {
      checkNodeStatus(backendUrl);
    }
  };

  const handleSaveBackendSettings = () => {
    if (isCustomBackend) {
      if (!backendUrl) {
        showInfo("Please enter a backend URL");
        return;
      }

      if (!urlRegex.test(backendUrl)) {
        showInfo("Invalid backend URL format");
        return;
      }

      if (!encryptKey) {
        showInfo("Please enter an Encryption Key");
        return;
      }

      if (!nodeStatus?.isUp) {
        showInfo("Cannot save settings - node is not responding");
        return;
      }

      localStorage.setItem("custom_backend_url", backendUrl);
      localStorage.setItem("custom_backend_encrypt_key", encryptKey);
      localStorage.setItem("use_custom_backend", "true");
    } else {
      localStorage.removeItem("custom_backend_url");
      localStorage.removeItem("custom_backend_encrypt_key");
      localStorage.setItem("use_custom_backend", "false");
    }

    showSuccess("Backend settings saved successfully");
  };

  const handleInstallPWA = async () => {
    if (!promptInstall) {
      showInfo("Cài đặt không khả dụng. Vui lòng sử dụng menu trình duyệt.");
      return;
    }
    
    try {
      promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === 'accepted') {
        showSuccess("Ứng dụng đã được cài đặt thành công!");
        setIsInstalled(true);
      } else {
        showInfo("Cài đặt đã bị hủy.");
      }
      setPromptInstall(null);
    } catch (error) {
      console.error('Install error:', error);
      showInfo("Có lỗi xảy ra khi cài đặt ứng dụng.");
    }
  };

  const handleManualInstall = () => {
    // Trigger manual install prompt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.promptInstall) {
          registration.promptInstall();
        } else {
          showInfo("Vui lòng sử dụng menu trình duyệt để cài đặt ứng dụng.");
        }
      });
    }
  };

  const NodeCard = ({ data }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm opacity-70">Node Status</span>
        <button
          className={`btn btn-sm btn-ghost gap-2 ${refreshCountdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleRefresh}
          disabled={refreshCountdown > 0 || isCheckingNode}
        >
          <RefreshCw 
            size={16} 
            className={`${isCheckingNode ? 'animate-spin' : ''}`}
          />
          {refreshCountdown > 0 ? `${refreshCountdown}s` : 'Refresh'}
        </button>
      </div>
      <div className={`relative flex items-center gap-4 p-4 rounded-lg w-full overflow-hidden ${
        data.isUp ? 'bg-success/15' : 'bg-error/15'
      }`}>
        <div className="flex items-start gap-4 z-10">
          {data.isUp ? <TbServerBolt size={20} className="text-success" /> : <TbServerOff size={20} className="text-error" />}
          <div className="flex flex-col">
            <span className={`flex items-center gap-2 font-medium ${data.isUp ? 'text-success' : 'text-error'}`}>
              {data.name}
            </span>
            <span className="text-base opacity-70">Latency: {data.latency}</span>
            <span className="text-sm opacity-50">
              Last checked: {lastCheckedTime ? lastCheckedTime.toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const settingsSections = [
    {
      id: "pwa",
      title: "Cài đặt ứng dụng",
      icon: <Smartphone size={20} />,
      description: "Cài đặt Locket Wan vào màn hình chính để sử dụng như ứng dụng riêng biệt",
      customContent: (
        <div className="space-y-4">
          {/* Debug info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>PWA Support: {supportsPWA ? 'Yes' : 'No'}</p>
            <p>Install Prompt: {promptInstall ? 'Available' : 'Not available'}</p>
            <p>Is Installed: {isInstalled ? 'Yes' : 'No'}</p>
            <p>Display Mode: {window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</p>
          </div>
          
          {!supportsPWA ? (
            <div className="alert alert-warning">
              <Download size={20} />
              <span>Trình duyệt của bạn không hỗ trợ cài đặt ứng dụng.</span>
            </div>
          ) : isInstalled ? (
            <div className="alert alert-success">
              <Download size={20} />
              <span>Ứng dụng đã được cài đặt trên thiết bị của bạn!</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="alert alert-info">
                <Download size={20} />
                <span>Bạn có thể cài đặt Locket Wan vào màn hình chính để sử dụng như ứng dụng riêng biệt.</span>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary flex-1 gap-2"
                  onClick={handleInstallPWA}
                  disabled={!promptInstall}
                >
                  <Download size={18} />
                  Cài đặt tự động
                </button>
                <button 
                  className="btn btn-outline flex-1 gap-2"
                  onClick={handleManualInstall}
                >
                  <Download size={18} />
                  Cài đặt thủ công
                </button>
              </div>
              {!promptInstall && (
                <div className="text-sm space-y-2 mt-4 p-3 bg-base-300 rounded-lg">
                  <p className="font-medium">Hướng dẫn cài đặt thủ công:</p>
                  <p><strong>Chrome/Edge:</strong> Menu (3 chấm) → "Cài đặt ứng dụng"</p>
                  <p><strong>Safari (iPhone):</strong> Share → "Thêm vào Màn hình chính"</p>
                  <p><strong>Chrome Mobile:</strong> Menu → "Cài đặt ứng dụng"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: "backend",
      title: "Backend Configuration",
      icon: <Server size={20} />,
      description: "Configure connection to backend server",
      customContent: (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Use custom backend</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isCustomBackend}
                onChange={(e) => setIsCustomBackend(e.target.checked)}
              />
            </label>
          </div>
          
          {isCustomBackend && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Backend URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://api.example.com"
                  className="input input-bordered w-full"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Encryption Key</span>
                </label>
                <div className="relative">
                  <input
                    type={showEncryptKey ? "text" : "password"}
                    placeholder="Enter encryption key"
                    className="input input-bordered w-full pr-10"
                    value={encryptKey}
                    onChange={(e) => setEncryptKey(e.target.value)}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEncryptKey(!showEncryptKey)}
                  >
                    {showEncryptKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {nodeStatus && <NodeCard data={nodeStatus} />}

              <label className="label">
                <span className="label-text-alt text-warning">
                  ⚠️ Only change these settings if you know what you're doing
                </span>
              </label>
            </>
          )}
          
          <button 
            className="btn btn-primary w-full"
            onClick={handleSaveBackendSettings}
            disabled={isCustomBackend && (isCheckingNode || !nodeStatus?.isUp)}
          >
            {isCheckingNode ? 'Checking Node...' : 'Save Backend Settings'}
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen bg-base-100">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🛠️ Developer Tools</h2>
        <div className="space-y-3">
          <a
            href="/cache"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors text-center mt-10"
          >
            🛠️ Cache Management
          </a>
          <p className="text-sm text-gray-600">
            Quản lý cache và debug cho website
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div
            key={section.id}
            className="card bg-base-200 shadow-xl"
          >
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                {section.icon}
                <h2 className="card-title">{section.title}</h2>
              </div>
              <p className="text-sm text-base-content/70 mb-4">
                {section.description}
              </p>
              {section.customContent}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage; 