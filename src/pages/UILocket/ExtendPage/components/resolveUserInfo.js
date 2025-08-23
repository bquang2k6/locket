export const createResolveUserInfo = (friendDetails, user) => {
  const map = new Map();
  try {
    (friendDetails || []).forEach((f) => {
      const name =
        `${f.firstName || ""} ${f.lastName || ""}`.trim() ||
        f.username || f.display_name || f.uid || "Người dùng";
      const avatar = f.profilePic || f.avatar || "/prvlocket.png";
      if (f.uid) map.set(String(f.uid), { name, avatar });
      if (f.username) map.set(String(f.username), { name, avatar });
    });
  } catch {}

  if (user) {
    const selfName = user.display_name || user.username || user.email || "Bạn";
    const selfAvatar = user.photoURL || user.avatar || "/prvlocket.png";
    if (user.localId) map.set(String(user.localId), { name: selfName, avatar: selfAvatar });
    if (user.username) map.set(String(user.username), { name: selfName, avatar: selfAvatar });
  }

  return (identifier) =>
    map.get(String(identifier)) || { name: "Người dùng", avatar: "/prvlocket.png" };
};
