// ✅ UPDATED: src/pages/measurements/clothVision.js
"use client";

/*
  Hybrid helper:
  ✅ First try backend: POST /classify-cloth
  ✅ If backend fails: fallback to client-side (dominant color + filename guessing)
*/

const API_BASE = "http://127.0.0.1:8001";

export async function getDominantHexFromImage(file) {
  try {
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;

    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("image load failed"));
    });

    const canvas = document.createElement("canvas");
    const size = 64; // small for speed
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size).data;

    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const rr = data[i];
      const gg = data[i + 1];
      const bb = data[i + 2];
      const aa = data[i + 3];

      // ignore transparent pixels
      if (aa < 30) continue;

      r += rr;
      g += gg;
      b += bb;
      count++;
    }

    URL.revokeObjectURL(imgUrl);

    if (!count) return "#ffffff";

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return "#ffffff";
  }
}

function pickFirst(list, fallback = null) {
  return Array.isArray(list) && list.length ? list[0] : fallback;
}

// ✅ simple keyword mapping from filename
function guessFromFileName(name) {
  const s = String(name || "").toLowerCase();

  // very basic guesses (you can expand anytime)
  if (s.includes("dress")) return { category: "Dresses" };
  if (s.includes("hoodie") || s.includes("sweater")) return { category: "Tops", subcategory: "Sweaters/Hoodies" };
  if (s.includes("shirt") || s.includes("blouse")) return { category: "Tops", subcategory: "Blouses/Shirts" };
  if (s.includes("crop") || s.includes("tank")) return { category: "Tops", subcategory: "Crop/Tank" };
  if (s.includes("tee") || s.includes("tshirt") || s.includes("t-shirt"))
    return { category: "Tops", subcategory: "T-shirts" };
  if (s.includes("jean")) return { category: "Bottoms", subcategory: "Jeans" };
  if (s.includes("trouser") || s.includes("pant")) return { category: "Bottoms", subcategory: "Trousers" };
  if (s.includes("skirt")) return { category: "Bottoms", subcategory: "Skirts" };
  if (s.includes("short")) return { category: "Bottoms", subcategory: "Shorts" };
  if (s.includes("jacket")) return { category: "Outerwear", subcategory: "Jackets" };
  if (s.includes("coat")) return { category: "Outerwear", subcategory: "Coats" };
  if (s.includes("blazer")) return { category: "Outerwear", subcategory: "Blazers" };

  return {};
}

async function classifyClothBackend(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/classify-cloth`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error("classify-cloth failed");
  }

  const data = await res.json(); // {gender, category, subcategory, style, color}

  // ✅ Convert backend result -> styleKey used in your catalogData
  // styleKey format in your project: `${category}__${subcategory}__${style}`
  const styleKey =
    data?.category && data?.subcategory && data?.style
      ? `${data.category}__${data.subcategory}__${data.style}`
      : null;

  return {
    gender: data?.gender || null,
    category: data?.category || null,
    subcategory: data?.subcategory || null,
    styleKey,
    color: data?.color || "#ffffff",
  };
}

async function classifyClothFallbackClient(file, catalog) {
  const guess = guessFromFileName(file?.name);
  const suggestedColor = await getDominantHexFromImage(file);

  // default gender: if user already selected gender in UI we won't override
  // but we can suggest Women if file name has "women" etc.
  let gender = null;
  const fn = String(file?.name || "").toLowerCase();
  if (fn.includes("women") || fn.includes("female")) gender = "Women";
  if (fn.includes("men") || fn.includes("male")) gender = "Men";

  // try to pick a plausible style list from catalog if we can
  let styleKey = null;
  if (gender && guess.category && guess.subcategory) {
    const styles = catalog?.subSubcategories?.[gender]?.[guess.category]?.[guess.subcategory];
    styleKey = pickFirst(styles)?.key || null;
  }

  return {
    gender,
    category: guess.category || null,
    subcategory: guess.subcategory || null,
    styleKey, // optional
    color: suggestedColor || "#ffffff",
  };
}

/*
  ✅ MAIN function:
  - try backend first
  - if backend is not running / fails -> fallback client logic
*/
export async function classifyClothClient(file, catalog) {
  try {
    return await classifyClothBackend(file);
  } catch (e) {
    return await classifyClothFallbackClient(file, catalog);
  }
}
