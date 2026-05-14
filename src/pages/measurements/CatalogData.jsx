// src/pages/measurements/CatalogData.jsx
"use client";

import { SIZE_TABLES, WOMEN_SIZE_GUIDES } from "./SizeGuides";

// ─────────────────────────────────────────────────────────────────────────────
//  ASSET IMPORTS
//  These are flat PNG files sitting directly inside src/assets/
//  e.g.  src/assets/Blouses.png,  src/assets/CropTops.png  etc.
//
//  ► "Shoes" does NOT exist in your assets folder, so we reuse Sneakers.
//  ► If any file is still missing, rename it to match the import below.
// ─────────────────────────────────────────────────────────────────────────────
import imgBlouses from "../../assets/Blouses.png";
import imgCropTops from "../../assets/CropTops.png";
import imgTShirts from "../../assets/TShirts.png";
import imgJeans from "../../assets/Jeans.png";
import imgTrousers from "../../assets/Trousers.png";
import imgSkirts from "../../assets/Skirts.png";
import imgShorts from "../../assets/Shorts.png";
import imgMaxi from "../../assets/Maxi.png";
import imgMidi from "../../assets/Midi.png";
import imgMini from "../../assets/Mini.png";
import imgSneakers from "../../assets/Sneakers.png";
import imgSlippers from "../../assets/Slippers.png";
import imgHats from "../../assets/Hats.png";
import imgLoungewear from "../../assets/Loungewear.png";
import imgActivewear from "../../assets/Activewear.png";
import imgShirts from "../../assets/Shirts.png";
import imgCollarless from "../../assets/Collarless.png";
import imgPants from "../../assets/Pants.png";

// No "Shoes.png" in your assets — reuse Sneakers as fallback
const imgShoes = imgSneakers;
const imgDefault = imgTShirts;

// ─── SUBCAT ICONS ─────────────────────────────────────────────
export const SUBCAT_ICONS = {
  "Blouses": imgBlouses,
  "Crop Tops": imgCropTops,
  "T-Shirts": imgTShirts,
  "Jeans": imgJeans,
  "Trousers": imgTrousers,
  "Skirts": imgSkirts,
  "Shorts": imgShorts,
  "Maxi": imgMaxi,
  "Midi": imgMidi,
  "Mini": imgMini,
  "Sneakers": imgSneakers,
  "Slippers": imgSlippers,
  "Shoes": imgShoes,
  "Hats": imgHats,
  "Loungewear": imgLoungewear,
  "Activewear": imgActivewear,
  "Shirts": imgShirts,
  "Collarless": imgCollarless,
  "Polo / Henley": imgShirts,
  "Pants": imgPants,
  "Styles": imgHats,
  "Models": imgHats,
  "Accessories": imgLoungewear, // Changed from imgHats to imgLoungewear for better distinction
  "_default": imgDefault,
};

// ─── SUBCAT BACKGROUND COLORS ─────────────────────────────────
export const SUBCAT_COLORS = {
  "Blouses": "#fce4f3",
  "Crop Tops": "#e4fce8",
  "T-Shirts": "#e4eefe",
  "Jeans": "#dbeafe",
  "Trousers": "#ede8ff",
  "Skirts": "#f3e8ff",
  "Shorts": "#fef9e4",
  "Maxi": "#fdecea",
  "Midi": "#fce4f3",
  "Mini": "#ede8ff",
  "Sneakers": "#fef9e4",
  "Slippers": "#e4fce8",
  "Shoes": "#fdecea",
  "Hats": "#f0ece8",
  "Loungewear": "#e4fce8",
  "Activewear": "#e4f8fc",
  "Shirts": "#ede8ff",
  "Collarless": "#e4fce8",
  "Polo / Henley": "#e4fce8",
  "Pants": "#ede8ff",
  "Styles": "#fff7ed",
  "Models": "#f9fafb",
  "Accessories": "#f1f5f9",
  "_default": "#f5f5f5",
};

/* =====================================================================================
   OUTFITS — all mesh names exactly match the GLB scene
   ===================================================================================== */
const OUTFITS = {
  Women: {
    Tops: {
      "Blouses": [
        { mesh: "Top_Blouse1", outfit: "LKR 2850", fabrics: ["Silk", "Satin"] },
        { mesh: "Top_Blouse2", outfit: "LKR 3000", fabrics: ["Cotton"] },
        { mesh: "Top_Blouse3", outfit: "LKR 3200", fabrics: ["Cotton"] },
        { mesh: "Top_Blouse4", outfit: "LKR 3400", fabrics: ["Rayon", "Crepe"] },
        { mesh: "Top_Blouse5", outfit: "LKR 3600", fabrics: ["Chiffon", "Rayon"] },
        { mesh: "Top_Blouse6", outfit: "LKR 3800", fabrics: ["Satin", "Rayon"] },
        { mesh: "Top_Blouse7", outfit: "LKR 4000", fabrics: ["Chiffon"] },
        { mesh: "Top_Blouse8", outfit: "LKR 4200", fabrics: ["Cotton"] },
        { mesh: "Top_Blouse9", outfit: "LKR 4400", fabrics: ["Silk"] },
        { mesh: "Top_Blouse10", outfit: "LKR 4600", fabrics: ["Rayon"] },
      ],
      "Crop Tops": [
        { mesh: "Top_Crop1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Top_Crop2", outfit: "LKR 3000", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Top_Crop3", outfit: "LKR 3200", fabrics: ["Satin"] },
        { mesh: "Top_Crop5", outfit: "LKR 3400", fabrics: ["Polyester", "Satin"] },
        { mesh: "Top_Crop6", outfit: "LKR 3600", fabrics: ["Cotton"] },
        { mesh: "Top_Crop7", outfit: "LKR 3800", fabrics: ["Spandex"] },
        { mesh: "Top_Crop8", outfit: "LKR 4000", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Top_Crop9", outfit: "LKR 4200", fabrics: ["Polyester"] },
        { mesh: "Top_Crop10", outfit: "LKR 4400", fabrics: ["Lace", "Cotton"] },
      ],
      "T-Shirts": [
        { mesh: "Top_T-shirt1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt2", outfit: "LKR 3000", fabrics: ["Cotton", "Jersey Knit"] },
        { mesh: "Top_T-shirt3", outfit: "LKR 3200", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Top_T-shirt4", outfit: "LKR 3400", fabrics: ["Polyester", "Spandex"] },
        { mesh: "Top_T-shirt5", outfit: "LKR 3600", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt6", outfit: "LKR 3800", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt7", outfit: "LKR 4000", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt8", outfit: "LKR 4200", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt9", outfit: "LKR 4400", fabrics: ["Cotton"] },
        { mesh: "Top_T-shirt10", outfit: "LKR 4600", fabrics: ["Cotton"] },
      ],
    },

    Bottoms: {
      "Jeans": [

        { mesh: "Bottom_Jeans2", outfit: "LKR 3000", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Bottom_Jeans3", outfit: "LKR 3200", fabrics: ["Cotton"] },
        { mesh: "Bottom_Jeans4", outfit: "LKR 3400", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Bottom_Jeans5", outfit: "LKR 3600", fabrics: ["Cotton"] },
        { mesh: "Bottom_Jeans6", outfit: "LKR 3800", fabrics: ["Cotton"] },
        { mesh: "Bottom_Jeans7", outfit: "LKR 4000", fabrics: ["Cotton"] },
        { mesh: "Bottom_Jeans8", outfit: "LKR 4200", fabrics: ["Cotton"] },
      ],
      "Shorts": [
        { mesh: "Bottom_Shorts1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Bottom_Shorts2", outfit: "LKR 2950", fabrics: ["Cotton"] }, // user list: Bottom_Shorts2
        { mesh: "Bottoms_Shorts2", outfit: "LKR 3000", fabrics: ["Linen", "Cotton"] },
      ],
      "Trousers": [
        { mesh: "Bottom_Trouser1", outfit: "LKR 2850", fabrics: ["Polyester"] },
        { mesh: "Bottom_Trouser2", outfit: "LKR 3000", fabrics: ["Linen", "Cotton"] },
        { mesh: "Bottom_Trouser3", outfit: "LKR 3200", fabrics: ["Rayon"] },
      ],
      "Skirts": [
        { mesh: "Bottoms_Skirt1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Bottoms_Skirt2", outfit: "LKR 3000", fabrics: ["Chiffon", "Rayon"] },
        { mesh: "Bottoms_Skirt3", outfit: "LKR 3200", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Bottoms_Skirt4", outfit: "LKR 3400", fabrics: ["Satin"] },
        { mesh: "Bottoms_Skirt5", outfit: "LKR 3600", fabrics: ["Rayon", "Chiffon"] },
        { mesh: "Bottoms_Skirt6", outfit: "LKR 3800", fabrics: ["Cotton", "Polyester"] },
        { mesh: "Bottoms_Skirt7", outfit: "LKR 4000", fabrics: ["Satin", "Silk"] },
        { mesh: "Bottoms_Skirt8", outfit: "LKR 4200", fabrics: ["Crepe"] },
      ],
    },

    Dresses: {
      "Maxi": [
        { mesh: "Dress_Maxi1", outfit: "LKR 2850", fabrics: ["Silk", "Satin"] },
      ],
      "Midi": [
        { mesh: "Dress_midi1", outfit: "LKR 2850", fabrics: ["Crepe", "Cotton"] },
        { mesh: "Dress_midi2", outfit: "LKR 3000", fabrics: ["Rayon", "Chiffon"] },
        { mesh: "Dress_midi3", outfit: "LKR 3200", fabrics: ["Rayon", "Crepe"] },
        { mesh: "Dress_midi4", outfit: "LKR 3400", fabrics: ["Cotton", "Linen"] },
        { mesh: "Dress_midi5", outfit: "LKR 3600", fabrics: ["Satin"] },
      ],
      "Mini": [
        { mesh: "Dress_mini1", outfit: "LKR 2850", fabrics: ["Cotton", "Jersey Knit"] },
        { mesh: "Dress_mini2", outfit: "LKR 3000", fabrics: ["Spandex"] },
        { mesh: "Dress_mini3", outfit: "LKR 3200", fabrics: ["Cotton"] },
        { mesh: "Dress_mini4", outfit: "LKR 3400", fabrics: ["Satin", "Silk"] },
      ],
    },

    Footwear: {
      "Sneakers": [
        { mesh: "Footwear_Sneakers1", outfit: "LKR 2850", fabrics: ["Canvas", "Rubber"] },
        { mesh: "Footwear_Sneakers2", outfit: "LKR 3000", fabrics: ["Synthetic", "Rubber"] },
      ],
      "Slippers": [
        { mesh: "Footwear_Slippers1 i", outfit: "LKR 2850", fabrics: ["Cotton", "Synthetic"] },
      ],
    },

    "Special Categories": {
      "Loungewear": [
        { mesh: "SC_Loungewear1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "SC_Loungewear2", outfit: "LKR 3050", fabrics: ["Cotton"] },
      ],
      "Activewear": [
        { mesh: "SP_Activewear1", outfit: "LKR 2850", fabrics: ["Spandex"] },
        { mesh: "SP_Activewear2", outfit: "LKR 3000", fabrics: ["Spandex"] },
      ],
      "Hats": [
        { mesh: "Hat_Black1", outfit: "LKR 1850", fabrics: ["Cotton"] },
        { mesh: "Hat_Gray2.001", outfit: "LKR 1950", fabrics: ["Wool"] },
      ],
    },

  },

  Men: {
    Tops: {
      "T-Shirts": [
        { mesh: "Tops_T-shirt1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt2", outfit: "LKR 3000", fabrics: ["Cotton", "Jersey Knit"] },
        { mesh: "Tops_T-shirt3", outfit: "LKR 3200", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt5", outfit: "LKR 3400", fabrics: ["Cotton", "Spandex"] },
        { mesh: "Tops_T-shirt6", outfit: "LKR 3600", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt7", outfit: "LKR 3800", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt8", outfit: "LKR 4000", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt9", outfit: "LKR 4200", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt10", outfit: "LKR 4400", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt11", outfit: "LKR 4600", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt12", outfit: "LKR 4800", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt13", outfit: "LKR 5000", fabrics: ["Cotton"] },
        { mesh: "Tops_T-shirt14", outfit: "LKR 5200", fabrics: ["Cotton"] },
      ],
      "Shirts": [
        { mesh: "Tops_Shirts1", outfit: "LKR 2850", fabrics: ["Cotton", "Crepe"] },
      ],
      "Collarless": [
        { mesh: "Tops_Collorless1", outfit: "LKR 2850", fabrics: ["Linen", "Rayon"] },
      ],
    },

    Bottoms: {
      "Jeans": [
        { mesh: "Bottoms_Jeans1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Bottoms_Jeans2", outfit: "LKR 3000", fabrics: ["Cotton", "Spandex"] },
      ],
      "Shorts": [
        { mesh: "Bottom_Shorts1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "Bottom_Shorts1.001", outfit: "LKR 2850", fabrics: ["Cotton"] },
      ],
      "Pants": [
        { mesh: "Bottoms_Pants1", outfit: "LKR 2850", fabrics: ["Polyester", "Crepe"] },
        { mesh: "Bottoms_Pants2", outfit: "LKR 3000", fabrics: ["Linen", "Rayon"] },
        { mesh: "Bottoms_Pants3", outfit: "LKR 3200", fabrics: ["Cotton", "Polyester"] },
        { mesh: "Bottoms_Pants4", outfit: "LKR 3400", fabrics: ["Cotton", "Polyester"] },
        { mesh: "Bottoms_Pants5", outfit: "LKR 3600", fabrics: ["Polyester"] },
        { mesh: "Bottoms_Pants6", outfit: "LKR 3800", fabrics: ["Linen"] },
      ],
    },

    Footwear: {
      "Shoes": [
        { mesh: "Footwear_Shoes1", outfit: "LKR 2850", fabrics: ["Leather"] },
      ],
      "Slippers": [
        { mesh: "Footwear_Slippers1 i", outfit: "LKR 2850", fabrics: ["Cotton", "Synthetic"] },
      ],
    },

    "Special Categories": {
      "Loungewear": [
        { mesh: "SC_Loungewear1", outfit: "LKR 2850", fabrics: ["Cotton"] },
        { mesh: "SC_Loungewear2", outfit: "LKR 3050", fabrics: ["Cotton"] },
      ],
      "Activewear": [
        { mesh: "SP_Activewear1", outfit: "LKR 2850", fabrics: ["Spandex"] },
        { mesh: "SP_Activewear2", outfit: "LKR 3000", fabrics: ["Spandex"] },
      ],
      "Hats": [
        { mesh: "Hat_Gray2", outfit: "LKR 1750", fabrics: ["Wool"] },
        { mesh: "Hat_Gray2.001", outfit: "LKR 1850", fabrics: ["Wool"] },
      ],
      "Accessories": [
        { mesh: "Object_6", outfit: "Prop", fabrics: ["Other"] },
      ],
    },


  },
};

/* =====================================================================================
   Helpers
   ===================================================================================== */
export function makeSubKey(gender, category, subcategory) {
  return `${gender}__${category}__${subcategory}`;
}

function buildCatalogData() {
  const genders = Object.keys(OUTFITS);
  const categories = {};
  const subcategories = {};
  const clothingItems = {};
  const sizeChart = {};

  genders.forEach((gender) => {
    const genderCats = Object.keys(OUTFITS[gender]);
    categories[gender] = genderCats;
    subcategories[gender] = {};

    genderCats.forEach((cat) => {
      const subs = Object.keys(OUTFITS[gender][cat]);
      subcategories[gender][cat] = subs;

      subs.forEach((sub) => {
        const subKey = makeSubKey(gender, cat, sub);
        const items = OUTFITS[gender][cat][sub];

        if (!clothingItems[subKey]) {
          clothingItems[subKey] = items.map((item, idx) => ({
            id: `${subKey}-${idx}`,
            name: item.mesh,
            meshName: item.mesh,
            category: cat,
            subcategory: sub,
            outfit: item.outfit,
            image: null,
            fabrics: item.fabrics,
          }));
          sizeChart[subKey] = ["XS", "S", "M", "L", "XL", "XXL"];
        }
      });
    });
  });

  return { categories, subcategories, clothingItems, sizeChart };
}

export const CATALOG = buildCatalogData();