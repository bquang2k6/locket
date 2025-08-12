import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthLocket';
import { getServerUsageStats, getCaptionUsageStats } from '../utils/serverValidation';
import { plans } from '../utils/plans';

const UsageDisplay = ({ className = "" }) => {
  const { user, userPlan } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get plan-based statistics
  const getPlanBasedStats = (userPlan, gifCaptionStats, captionStats) => {
    if (!userPlan) return null;

    const planDetails = plans.find(plan => plan.id === userPlan.plan_id) || plans[0];
    
    let captionLimit = 1;
    let gifCaptionLimit = 2;

    // Extract caption limit from plan perks
    const captionPerk = Object.keys(planDetails.perks).find(perk =>
      perk.includes('caption') && perk.includes('lần') && perk.includes('ngày') && !perk.includes('gif')
    );
    if (captionPerk) {
      const match = captionPerk.match(/(\d+)\s*lần/);
      captionLimit = match ? parseInt(match[1]) : 1;
    }

    // Extract GIF caption limit from plan perks
    const gifCaptionPerk = Object.keys(planDetails.perks).find(perk =>
      perk.includes('gif') && perk.includes('caption') && perk.includes('lần') && perk.includes('ngày')
    );
    if (gifCaptionPerk) {
      const match = gifCaptionPerk.match(/(\d+)\s*lần/);
      gifCaptionLimit = match ? parseInt(match[1]) : 2;
    }

    // Check for unlimited GIF caption
    const isUnlimitedGif = Object.keys(planDetails.perks).some(perk =>
      perk.includes('Không giới hạn') || perk.includes('unlimited')
    );

    const today = new Date().toISOString().split('T')[0];

    return {
      caption: {
        used: captionStats?.caption?.used || 0,
        limit: captionLimit,
        unlimited: captionLimit === Infinity
      },
      gif_caption: {
        used: gifCaptionStats?.gif_caption?.used || 0,
        limit: isUnlimitedGif ? Infinity : gifCaptionLimit,
        unlimited: isUnlimitedGif
      },
      fileSize: {
        maxImageSize: planDetails.max_image_size || 3,
        maxVideoSize: planDetails.max_video_size || 7
      },
      reset_time: `${today}T00:00:00+00:00`
    };
  };

  // Fetch usage statistics
  const fetchStats = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const [gifCaptionStats, captionStats] = await Promise.all([
        getServerUsageStats(user.uid, userPlan),
        getCaptionUsageStats(user.uid, userPlan)
      ]);

      const planStats = getPlanBasedStats(userPlan, gifCaptionStats, captionStats);
      setStats(planStats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Không thể tải thông tin sử dụng');
      // Fallback to plan-only stats
      const planStats = getPlanBasedStats(userPlan, null, null);
      setStats(planStats);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function
  const forceRefresh = () => {
    fetchStats();
  };

  // Setup event listeners and auto-refresh
  useEffect(() => {
    if (!user?.uid) return;

    // Initial fetch
    fetchStats();

    // Auto-refresh every 10 seconds
    const intervalId = setInterval(fetchStats, 10000);

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('usage') || e.key.includes('caption'))) {
        fetchStats();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom refresh events
    const handleCustomRefresh = () => fetchStats();
    window.addEventListener('usage-refresh', handleCustomRefresh);

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh when window is focused
    const handleWindowFocus = () => fetchStats();
    window.addEventListener('focus', handleWindowFocus);

    // Keyboard shortcut for refresh (Ctrl/Cmd + F5)
    const handleKeyDown = (e) => {
      if (e.key === 'F5' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        forceRefresh();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usage-refresh', handleCustomRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user?.uid, userPlan]);

  // Don't render if no user or plan
  if (!user || !userPlan) return null;

  // Loading state
  if (loading && !stats) {
    return (
      <div className={`bg-base-100 rounded-lg p-4 border -mt-2 ${className}`}>
        <div className="flex justify-between items-center -mt-4 -mb-4">
          <h3 className="text-lg font-semibold">Giới hạn sử dụng hôm nay</h3>
        </div>
        <div className="mt-3">
          <div className="text-sm text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className={`bg-base-100 rounded-lg p-4 border -mt-2 ${className}`}>
        <div className="flex justify-between items-center -mt-4 -mb-4">
          <h3 className="text-lg font-semibold">Giới hạn sử dụng hôm nay</h3>
        </div>
        <div className="mt-3">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const formatUsage = (used, limit, unlimited) => {
    return unlimited ? '∞' : `${used}/${limit}`;
  };

  return (
    <div className={`bg-base-100 rounded-lg p-4 border -mt-2 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center -mt-4 -mb-4">
        <div 
          className="flex items-center cursor-pointer"
          onClick={toggleExpanded}
        >
          <h3 className="text-lg font-semibold">Giới hạn sử dụng hôm nay</h3>
          <div className={`transform transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600"
            >
              <path 
                d="M7 10L12 15L17 10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              forceRefresh();
            }}
            className={`btn btn-sm ${loading ? 'btn-loading' : 'btn-ghost'} btn-circle`}
            title="Làm mới thông tin sử dụng (Ctrl/Cmd + F5)"
            disabled={loading}
          >
            {!loading && (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          
          {/* Auto-refresh indicator */}
          <div className="text-xs text-gray-400">
            <div 
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse" 
              title="Auto-refresh mỗi 10 giây"
            />
          </div>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && stats && (
        <div className="mt-3 space-y-3">          
          {/* Usage Stats */}
          <div className="mb-1">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium mt-1">
                Caption Posts: 
                <span className="text-sm ml-1">
                  {formatUsage(
                    stats.caption?.used || 0, 
                    stats.caption?.limit || 0, 
                    stats.caption?.unlimited
                  )}
                </span>
                <span className="ml-6">GIF Caption:</span>
                <span className="text-sm ml-1">
                  {formatUsage(
                    stats.gif_caption?.used || 0, 
                    stats.gif_caption?.limit || 0, 
                    stats.gif_caption?.unlimited
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {/* File Size Limits */}
          <div className="text-xs text-gray-600 pt-2 border-t -mb-2">
            <div>
              Giới hạn ảnh: {stats.fileSize?.maxImageSize || 'N/A'}MB - 
              Giới hạn video: {stats.fileSize?.maxVideoSize || 'N/A'}MB
            </div>
            {lastUpdated && (
              <div className="mt-1 text-gray-500">
                Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for other components to trigger refresh
export const triggerUsageRefresh = () => {
  window.dispatchEvent(new CustomEvent('usage-refresh'));
};

export default UsageDisplay;