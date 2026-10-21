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

async function save(route: string, key: string, list: any[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: list }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const getFirebaseGallery = () => getStored("gallery", "items");
export const saveFirebaseGallery = (items: any[]) => save("gallery", "items", items);
export const getFirebaseMembers = () => getStored("members", "members");
export const saveFirebaseMembers = (members: any[]) => save("members", "members", members);
export const getFirebaseVideos = () => getStored("videos", "videos");
export const saveFirebaseVideos = (videos: any[]) => save("videos", "videos", videos);
