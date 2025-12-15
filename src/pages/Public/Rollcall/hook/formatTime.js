// formatTime.js
export default function formatTime(seconds) {
  if (!seconds) return "";

  const postDate = new Date(seconds * 1000);
  const now = new Date();
  const diff = Math.floor((now - postDate) / 1000); // chênh lệch giây

  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

  return postDate.toLocaleDateString(); // quá 1 tuần thì hiển thị ngày tháng
}
