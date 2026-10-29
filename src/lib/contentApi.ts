// Browser-side helpers for the admin CMS pages. They go through the server API
// (which checks the admin login) instead of writing to Firestore from the browser.

async function getStored(route: string, key: string): Promise<any[] | null> {
  try {
    const res = await fetch(`/api/${route}?raw=1`, { cache: "no-store" });
    const json = await res.json();
    return Array.isArray(json?.[key]) ? json[key] : null;
  } catch {
    return null;
  }
}

// allowEmpty: the server refuses to replace a non-empty list with an empty one unless this is set
async function save(route: string, key: string, list: any[], allowEmpty = false): Promise<boolean> {
  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: list, ...(allowEmpty ? { allowEmpty: true } : {}) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const getFirebaseGallery = () => getStored("gallery", "items");
export const saveFirebaseGallery = (items: any[], allowEmpty = false) => save("gallery", "items", items, allowEmpty);
export const getFirebaseMembers = () => getStored("members", "members");
export const saveFirebaseMembers = (members: any[]) => save("members", "members", members);
export const getFirebaseVideos = () => getStored("videos", "videos");
export const saveFirebaseVideos = (videos: any[], allowEmpty = false) => save("videos", "videos", videos, allowEmpty);
