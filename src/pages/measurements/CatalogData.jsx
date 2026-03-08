// src/pages/measurements/catalogData.js
"use client";

import hh from "../../assets/hh.jpg";
import { SIZE_TABLES, WOMEN_SIZE_GUIDES } from "./sizeGuides";

const STYLE_IMG = "/images/ap.jpg";

/* =====================================================================================
   ✅ MASTER OUTFIT DATABASE (Women + Men)
   ===================================================================================== */

const OUTFITS = {
  Women: {
    Tops: {
      "T-shirts": [
        { style: "Casual", outfit: "Graphic tee + jeans", sizeRef: "Bust", fabrics: ["Cotton"] },
        { style: "Streetwear", outfit: "Oversized tee + cargos", sizeRef: "Bust & Shoulder Width", fabrics: ["Cotton", "Jersey Knit"] },
        { style: "Smart Casual", outfit: "Plain fitted tee + blazer", sizeRef: "Bust & Length", fabrics: ["Cotton", "Spandex"] },
        { style: "Athleisure", outfit: "Sport tee + leggings", sizeRef: "Bust (stretch fit)", fabrics: ["Polyester", "Spandex"] },
      ],
      "Blouses/Shirts": [
        { style: "Business Casual", outfit: "Silk blouse + trousers", sizeRef: "Bust & Shoulder Width", fabrics: ["Silk", "Satin"] },
        { style: "Formal", outfit: "Structured shirt + pencil skirt", sizeRef: "Bust & Shoulder Width", fabrics: ["Cotton"] },
        { style: "Preppy", outfit: "Oxford shirt + sweater vest", sizeRef: "Bust", fabrics: ["Cotton"] },
        { style: "Minimalist", outfit: "Plain blouse + tailored pants", sizeRef: "Bust", fabrics: ["Rayon", "Crepe"] },
      ],
      "Crop/Tank": [
        { style: "Summer", outfit: "Tank + shorts", sizeRef: "Bust", fabrics: ["Cotton"] },
        { style: "Streetwear", outfit: "Crop tee + joggers", sizeRef: "Bust / Waist", fabrics: ["Cotton", "Spandex"] },
        { style: "Party", outfit: "Sequined crop + leather pants", sizeRef: "Bust", fabrics: ["Satin"] },
        { style: "Y2K", outfit: "Halter crop + mini skirt", sizeRef: "Bust", fabrics: ["Polyester", "Satin", "Spandex"] },
      ],
      "Sweaters/Hoodies": [
        { style: "Cozy", outfit: "Chunky knit + leggings", sizeRef: "Bust / Chest", fabrics: ["Rayon", "Polyester"] },
        { style: "Street", outfit: "Oversized hoodie + cargos", sizeRef: "Bust / Chest", fabrics: ["Cotton", "Polyester"] },
        { style: "Smart Casual", outfit: "Turtleneck + blazer", sizeRef: "Bust / Neck", fabrics: ["Cotton", "Rayon"] },
        { style: "Preppy", outfit: "Cable-knit sweater + skirt", sizeRef: "Bust", fabrics: ["Cotton"] },
      ],
    },

    Bottoms: {
      Jeans: [
        { style: "Casual", outfit: "Blue denim + tee", sizeRef: "Waist & Hip", fabrics: ["Cotton"] },
        { style: "Chic", outfit: "High-waist jeans + blouse", sizeRef: "Waist & Hip", fabrics: ["Cotton", "Spandex"] },
        { style: "Streetwear", outfit: "Baggy jeans + crop top", sizeRef: "Waist (loose)", fabrics: ["Cotton"] },
        { style: "Smart Casual", outfit: "Dark skinny jeans + blazer", sizeRef: "Waist & Hip", fabrics: ["Cotton", "Spandex"] },
      ],
      Trousers: [
        { style: "Business", outfit: "Tailored trousers + button-up", sizeRef: "Waist & Inseam", fabrics: ["Polyester"] },
        { style: "Casual", outfit: "Wide-leg pants + tee", sizeRef: "Waist & Length", fabrics: ["Linen", "Cotton"] },
        { style: "Minimalist", outfit: "Neutral slacks + crop top", sizeRef: "Waist & Hip", fabrics: ["Rayon"] },
        { style: "Edgy", outfit: "Leather pants + jacket", sizeRef: "Waist & Hip", fabrics: ["Polyester"] },
      ],
      Skirts: [
        { style: "Casual", outfit: "Denim skirt + tee", sizeRef: "Waist & Hip", fabrics: ["Cotton"] },
        { style: "Feminine", outfit: "Floral midi + blouse", sizeRef: "Waist & Hip", fabrics: ["Chiffon", "Rayon", "Crepe"] },
        { style: "Office", outfit: "Pencil skirt + shirt", sizeRef: "Waist & Hip", fabrics: ["Cotton", "Spandex"] },
        { style: "Party", outfit: "Sequin mini + heels", sizeRef: "Waist & Hip", fabrics: ["Satin"] },
      ],
      Shorts: [
        { style: "Summer", outfit: "Linen shorts + crop", sizeRef: "Waist & Hip", fabrics: ["Linen", "Cotton"] },
        { style: "Casual", outfit: "Denim shorts + tank", sizeRef: "Waist & Hip", fabrics: ["Cotton"] },
        { style: "Street", outfit: "Cargo shorts + oversized tee", sizeRef: "Waist (relaxed)", fabrics: ["Cotton"] },
        { style: "Resort", outfit: "Paperbag shorts + sandals", sizeRef: "Waist & Hip", fabrics: ["Linen", "Rayon"] },
      ],
    },

    Dresses: {
      Mini: [
        { style: "Casual", outfit: "Cotton mini + sneakers", sizeRef: "Bust, Waist, Hip & Length", fabrics: ["Cotton", "Jersey Knit"] },
        { style: "Party", outfit: "Bodycon + heels", sizeRef: "Bust, Waist & Hip", fabrics: ["Polyester", "Spandex"] },
        { style: "Date Night", outfit: "Wrap mini + boots", sizeRef: "Bust & Waist", fabrics: ["Rayon", "Crepe", "Satin"] },
        { style: "Y2K", outfit: "Slip mini + platforms", sizeRef: "Bust & Hip", fabrics: ["Satin", "Silk"] },
      ],
      Midi: [
        { style: "Business Casual", outfit: "Structured midi + blazer", sizeRef: "Bust, Waist & Hip", fabrics: ["Crepe", "Cotton"] },
        { style: "Boho", outfit: "Flowy midi + sandals", sizeRef: "Bust & Waist", fabrics: ["Rayon", "Chiffon"] },
        { style: "Smart Casual", outfit: "Printed midi + flats", sizeRef: "Bust & Waist", fabrics: ["Rayon", "Crepe"] },
        { style: "Summer", outfit: "Floral midi + hat", sizeRef: "Bust, Waist & Hip", fabrics: ["Cotton", "Linen"] },
      ],
      Maxi: [
        { style: "Formal", outfit: "Silk maxi + heels", sizeRef: "Bust, Waist, Hip & Length", fabrics: ["Silk", "Satin"] },
        { style: "Resort", outfit: "Flowy maxi + sandals", sizeRef: "Bust, Waist & Length", fabrics: ["Rayon", "Chiffon"] },
        { style: "Casual", outfit: "Jersey maxi + slides", sizeRef: "Bust & Waist", fabrics: ["Jersey Knit"] },
        { style: "Bohemian", outfit: "Printed maxi + jewelry", sizeRef: "Bust, Waist & Length", fabrics: ["Rayon", "Crepe"] },
      ],
    },

    Outerwear: {
      Jackets: [
        { style: "Casual", outfit: "Denim jacket + tee", sizeRef: "Bust & Shoulder", fabrics: ["Cotton"] },
        { style: "Streetwear", outfit: "Bomber + cargos", sizeRef: "Bust & Sleeve", fabrics: ["Polyester"] },
        { style: "Chic", outfit: "Leather jacket + dress", sizeRef: "Bust & Shoulder", fabrics: ["Polyester"] },
        { style: "Winter", outfit: "Puffer jacket + boots", sizeRef: "Bust & Sleeve", fabrics: ["Polyester"] },
      ],
      Coats: [
        { style: "Business", outfit: "Trench coat + pumps", sizeRef: "Bust, Shoulder & Length", fabrics: ["Cotton", "Polyester"] },
        { style: "Minimalist", outfit: "Long neutral coat + turtleneck", sizeRef: "Bust & Shoulder", fabrics: ["Rayon"] },
        { style: "Formal", outfit: "Wool coat + gown", sizeRef: "Bust & Length", fabrics: ["Rayon"] },
        { style: "Trendy", outfit: "Oversized coat + boots", sizeRef: "Bust (oversized)", fabrics: ["Polyester"] },
      ],
      Blazers: [
        { style: "Business", outfit: "Tailored blazer + trousers", sizeRef: "Bust & Shoulder", fabrics: ["Polyester"] },
        { style: "Smart Casual", outfit: "Oversized blazer + jeans", sizeRef: "Bust (loose)", fabrics: ["Linen", "Cotton"] },
        { style: "Chic", outfit: "Colored blazer + heels", sizeRef: "Bust & Shoulder", fabrics: ["Crepe", "Polyester"] },
        { style: "Minimalist", outfit: "Neutral blazer + dress", sizeRef: "Bust & Waist", fabrics: ["Linen", "Cotton"] },
      ],
    },

    Footwear: {
      Heels: [
        { style: "Formal", outfit: "Stilettos + gown", sizeRef: "US/EU Shoe Size", fabrics: ["Satin"] },
        { style: "Party", outfit: "Platform heels + mini", sizeRef: "US/EU Shoe Size", fabrics: ["Satin"] },
        { style: "Business", outfit: "Block heels + trousers", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Chic", outfit: "Kitten heels + skirt", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
      ],
      Boots: [
        { style: "Winter", outfit: "Knee-high boots + coat", sizeRef: "US/EU + Calf", fabrics: ["Polyester"] },
        { style: "Streetwear", outfit: "Combat boots + mini dress", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Western", outfit: "Cowboy boots + denim", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Trendy", outfit: "Chunky boots + trench", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
      ],
      "Flats/Sandals": [
        { style: "Casual", outfit: "Ballet flats + dress", sizeRef: "US/EU Shoe Size", fabrics: ["Cotton"] },
        { style: "Summer", outfit: "Flip-flops + shorts", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Minimalist", outfit: "Leather slides + maxi", sizeRef: "US/EU Shoe Size", fabrics: ["Cotton"] },
        { style: "Resort", outfit: "Espadrilles + skirt", sizeRef: "US/EU Shoe Size", fabrics: ["Cotton", "Linen"] },
      ],
      Sneakers: [
        { style: "Casual", outfit: "White sneakers + jeans", sizeRef: "US/EU Shoe Size", fabrics: ["Cotton", "Polyester"] },
        { style: "Streetwear", outfit: "Chunky sneakers + cargos", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Athleisure", outfit: "Running shoes + leggings", sizeRef: "US/EU Shoe Size", fabrics: ["Polyester"] },
        { style: "Minimalist", outfit: "Plain sneakers + mono outfit", sizeRef: "US/EU Shoe Size", fabrics: ["Cotton", "Polyester"] },
      ],
    },

    "Special Categories": {
      Loungewear: [
        { style: "Cozy", outfit: "Sweatshirt + joggers", sizeRef: "Bust & Waist", fabrics: ["Cotton", "Polyester"] },
        { style: "Minimalist", outfit: "Neutral knit set", sizeRef: "Bust & Waist", fabrics: ["Rayon", "Cotton"] },
        { style: "Trendy", outfit: "Crop + sweatpants", sizeRef: "Bust & Waist", fabrics: ["Cotton", "Polyester"] },
      ],
      Activewear: [
        { style: "Gym", outfit: "Leggings + sports bra", sizeRef: "Bust, Waist & Hip", fabrics: ["Polyester", "Spandex"] },
        { style: "Street", outfit: "Track pants + hoodie", sizeRef: "Bust & Waist", fabrics: ["Polyester", "Cotton"] },
        { style: "Yoga", outfit: "Stretch set + tank", sizeRef: "Bust, Waist & Hip", fabrics: ["Polyester", "Spandex"] },
      ],
      Formalwear: [
        { style: "Business Formal", outfit: "Pantsuit + heels", sizeRef: "Bust, Waist & Hip", fabrics: ["Crepe", "Polyester"] },
        { style: "Black Tie", outfit: "Evening gown", sizeRef: "Bust, Waist, Hip & Length", fabrics: ["Silk", "Satin", "Chiffon"] },
        { style: "Semi-Formal", outfit: "Cocktail dress + pumps", sizeRef: "Bust, Waist & Hip", fabrics: ["Satin", "Polyester"] },
      ],
    },
  },

  Men: {
    Tops: {
      "T-shirts": [
        { style: "Casual", outfit: "Basic tee + jeans", sizeRef: "Chest", fabrics: ["Cotton"] },
        { style: "Streetwear", outfit: "Oversized tee + cargos", sizeRef: "Chest (loose)", fabrics: ["Cotton", "Jersey Knit"] },
        { style: "Oversized", outfit: "Oversized tee + baggy jeans", sizeRef: "Chest (relaxed)", fabrics: ["Cotton"] },
        { style: "Smart Casual", outfit: "Fitted tee + blazer", sizeRef: "Chest", fabrics: ["Cotton", "Spandex"] },
        { style: "Athleisure/Sporty", outfit: "Sport tee + joggers", sizeRef: "Chest", fabrics: ["Polyester", "Spandex"] },
      ],
      Shirts: [
        { style: "Business", outfit: "Dress shirt + trousers", sizeRef: "Chest & Neck", fabrics: ["Cotton", "Crepe"] },
        { style: "Formal", outfit: "White shirt + suit", sizeRef: "Chest & Neck", fabrics: ["Cotton"] },
        { style: "Preppy", outfit: "Button-down + sweater", sizeRef: "Chest & Shoulder", fabrics: ["Cotton"] },
        { style: "Minimalist", outfit: "Linen shirt + tailored pants", sizeRef: "Chest", fabrics: ["Rayon", "Linen"] },
      ],
      "Polos / Henleys": [
        { style: "Casual Polo", outfit: "Polo + shorts", sizeRef: "Chest", fabrics: ["Cotton"] },
        { style: "Smart Polo", outfit: "Polo + chinos", sizeRef: "Chest", fabrics: ["Cotton", "Spandex"] },
        { style: "Sporty Polo", outfit: "Henley + joggers", sizeRef: "Chest & Arm Length", fabrics: ["Polyester", "Spandex"] },
      ],
      "Sweaters / Hoodies": [
        { style: "Casual Hoodie", outfit: "Hoodie + jeans", sizeRef: "Chest", fabrics: ["Cotton", "Polyester"] },
        { style: "Street Hoodie", outfit: "Hoodie + cargos", sizeRef: "Chest (relaxed)", fabrics: ["Cotton"] },
        { style: "Smart Casual Sweater", outfit: "Knit sweater + shirt", sizeRef: "Chest & Shoulder", fabrics: ["Rayon", "Cotton"] },
        { style: "Minimalist Knit", outfit: "Neutral knit + trousers", sizeRef: "Chest", fabrics: ["Rayon"] },
      ],
    },

    Bottoms: {
      Jeans: [
        { style: "Casual", outfit: "Blue denim + tee", sizeRef: "Waist & Inseam", fabrics: ["Cotton"] },
        { style: "Slim Fit", outfit: "Slim jeans + sweater", sizeRef: "Waist & Inseam", fabrics: ["Cotton", "Spandex"] },
        { style: "Streetwear", outfit: "Distressed jeans + hoodie", sizeRef: "Waist & Inseam", fabrics: ["Cotton"] },
        { style: "Smart Denim", outfit: "Dark denim + blazer", sizeRef: "Waist & Inseam", fabrics: ["Cotton", "Spandex"] },
      ],
      "Pants / Trousers": [
        { style: "Business", outfit: "Suit trousers + shirt", sizeRef: "Waist & Inseam", fabrics: ["Polyester", "Crepe"] },
        { style: "Smart Casual", outfit: "Chinos + polo", sizeRef: "Waist & Inseam", fabrics: ["Linen", "Rayon"] },
        { style: "Minimalist", outfit: "Tailored pants + tee", sizeRef: "Waist & Hip", fabrics: ["Rayon"] },
        { style: "Streetwear", outfit: "Cargo pants + hoodie", sizeRef: "Waist", fabrics: ["Cotton", "Polyester"] },
      ],
      Shorts: [
        { style: "Casual", outfit: "Cotton shorts + tee", sizeRef: "Waist", fabrics: ["Cotton"] },
        { style: "Sport", outfit: "Athletic shorts + tank", sizeRef: "Waist", fabrics: ["Polyester", "Spandex"] },
        { style: "Summer", outfit: "Linen shorts + shirt", sizeRef: "Waist", fabrics: ["Linen", "Cotton"] },
        { style: "Streetwear", outfit: "Cargo shorts + sneakers", sizeRef: "Waist", fabrics: ["Cotton"] },
      ],
    },

    Outerwear: {
      Jackets: [
        { style: "Casual", outfit: "Cotton jacket + tee", sizeRef: "Chest & Shoulder", fabrics: ["Cotton"] },
        { style: "Streetwear", outfit: "Bomber + cargos", sizeRef: "Chest & Sleeves", fabrics: ["Polyester"] },
        { style: "Smart Casual", outfit: "Minimal blazer jacket + chinos", sizeRef: "Chest & Shoulder", fabrics: ["Cotton", "Rayon"] },
        { style: "Sport Jacket", outfit: "Track jacket + joggers", sizeRef: "Chest", fabrics: ["Polyester", "Spandex"] },
      ],
      Coats: [
        { style: "Business", outfit: "Trench coat + suit", sizeRef: "Chest & Shoulder", fabrics: ["Polyester", "Rayon"] },
        { style: "Minimalist", outfit: "Simple overcoat + turtleneck", sizeRef: "Chest & Length", fabrics: ["Rayon"] },
        { style: "Smart Casual", outfit: "Lightweight coat + chinos", sizeRef: "Chest", fabrics: ["Cotton", "Linen"] },
        { style: "Trendy", outfit: "Patterned coat + trousers", sizeRef: "Chest", fabrics: ["Polyester"] },
      ],
      Blazers: [
        { style: "Business", outfit: "Suit blazer + trousers", sizeRef: "Chest, Shoulder, Waist", fabrics: ["Polyester"] },
        { style: "Smart Casual", outfit: "Unstructured blazer + jeans", sizeRef: "Chest & Shoulder", fabrics: ["Linen", "Cotton"] },
        { style: "Minimalist", outfit: "Monotone blazer + trousers", sizeRef: "Chest & Shoulder", fabrics: ["Crepe", "Polyester"] },
        { style: "Trendy", outfit: "Patterned blazer + loafers", sizeRef: "Chest & Shoulder", fabrics: ["Polyester"] },
      ],
    },

    Footwear: {
      "Dress Shoes": [{ outfit: "Dress shoes + formalwear", sizeRef: "Shoe Size", fabrics: ["Satin", "Polyester"] }],
      "Business Shoes": [{ outfit: "Business shoes + office outfit", sizeRef: "Shoe Size", fabrics: ["Polyester"] }],
      "Casual Sneakers": [{ outfit: "Casual sneakers + jeans", sizeRef: "Shoe Size", fabrics: ["Cotton"] }],
      "Athleisure Sneakers": [{ outfit: "Athleisure sneakers + joggers", sizeRef: "Shoe Size", fabrics: ["Polyester", "Spandex"] }],
      "Street Sneakers": [{ outfit: "Street sneakers + cargos", sizeRef: "Shoe Size", fabrics: ["Cotton", "Polyester"] }],
      Boots: [{ outfit: "Boots + jacket", sizeRef: "Shoe Size", fabrics: ["Polyester"] }],
      "Chelsea Boots": [{ outfit: "Chelsea boots + trousers", sizeRef: "Shoe Size", fabrics: ["Polyester"] }],
      "Trendy Boots": [{ outfit: "Trendy boots + coat", sizeRef: "Shoe Size", fabrics: ["Polyester"] }],
      Sandals: [{ outfit: "Sandals + shorts", sizeRef: "Shoe Size", fabrics: ["Cotton"] }],
      Slides: [{ outfit: "Slides + loungewear", sizeRef: "Shoe Size", fabrics: ["Cotton", "Polyester"] }],
      Espadrilles: [{ outfit: "Espadrilles + resort outfit", sizeRef: "Shoe Size", fabrics: ["Cotton", "Linen"] }],
    },

    "Special Categories": {
      Loungewear: [
        { style: "Casual", outfit: "Casual loungewear set", sizeRef: "Chest & Waist", fabrics: ["Cotton", "Polyester"] },
        { style: "Minimalist", outfit: "Minimalist loungewear set", sizeRef: "Chest & Waist", fabrics: ["Rayon", "Cotton"] },
        { style: "Cozy", outfit: "Cozy set", sizeRef: "Chest & Waist", fabrics: ["Jersey Knit"] },
      ],
      Activewear: [
        { style: "Gym", outfit: "Gym set", sizeRef: "Chest & Waist", fabrics: ["Polyester", "Spandex"] },
        { style: "Running", outfit: "Running set", sizeRef: "Chest & Waist", fabrics: ["Polyester", "Spandex"] },
        { style: "Training", outfit: "Training set", sizeRef: "Chest & Waist", fabrics: ["Polyester", "Spandex"] },
      ],
      Formalwear: [
        { style: "Business Formal", outfit: "Business formal suit", sizeRef: "Chest & Waist", fabrics: ["Crepe", "Polyester"] },
        { style: "Evening", outfit: "Evening formal", sizeRef: "Chest & Waist", fabrics: ["Satin", "Silk"] },
        { style: "Semi-Formal", outfit: "Semi-formal", sizeRef: "Chest & Waist", fabrics: ["Polyester", "Satin"] },
      ],
    },
  },
};

/* =====================================================================================
   ✅ Helpers
   ===================================================================================== */

export function makeStyleKey(category, subcategory, style) {
  return `${category}__${subcategory}__${style}`;
}

/* =====================================================================================
   ✅ Build UI datasets from OUTFITS
   - FIXED: Men Footwear one tile per footwear name
   - Adds special cloth item name "preppy1.glb" for your Preppy style
   - Adds special cloth item name "sequined_crop_party.glb" for Women Crop/Tank Party
   ===================================================================================== */

function buildCatalogData() {
  const genders = Object.keys(OUTFITS);

  const categories = {};
  const subcategories = {};
  const subSubcategories = {};
  const clothingItems = {};
  const sizeChart = { Women: {}, Men: {} };

  genders.forEach((gender) => {
    const genderCats = Object.keys(OUTFITS[gender]);
    categories[gender] = genderCats;

    subcategories[gender] = {};
    subSubcategories[gender] = {};

    genderCats.forEach((cat) => {
      const subs = Object.keys(OUTFITS[gender][cat]);
      subcategories[gender][cat] = subs;

      subSubcategories[gender][cat] = {};

      subs.forEach((sub) => {
        const styles = OUTFITS[gender][cat][sub];

        // ✅ Men Footwear special: one tile per footwear name
        if (gender === "Men" && cat === "Footwear") {
          subSubcategories[gender][cat][sub] = [
            {
              key: makeStyleKey(cat, sub, sub),
              name: sub,
              image: STYLE_IMG,
            },
          ];
        } else {
          subSubcategories[gender][cat][sub] = styles.map((s) => ({
            key: makeStyleKey(cat, sub, s.style),
            name: s.style,
            image: STYLE_IMG,
          }));
        }

        styles.forEach((s) => {
          const isMenFootwear = gender === "Men" && cat === "Footwear";
          const styleKey = isMenFootwear ? makeStyleKey(cat, sub, sub) : makeStyleKey(cat, sub, s.style);

          if (!clothingItems[styleKey]) {
            // ✅ Special: Men -> Tops -> Shirts -> Preppy
            if (gender === "Men" && cat === "Tops" && sub === "Shirts" && s.style === "Preppy") {
              clothingItems[styleKey] = [
                { id: `${styleKey}-1`, name: "preppy1.glb", image: hh }, // ✅ real GLB
                { id: `${styleKey}-2`, name: `${s.outfit} (Option 2)`, image: hh },
                { id: `${styleKey}-3`, name: `${s.outfit} (Option 3)`, image: hh },
                { id: `${styleKey}-4`, name: `${s.outfit} (Option 4)`, image: hh },
                { id: `${styleKey}-5`, name: `${s.outfit} (Option 5)`, image: hh },
              ];

              // ✅ Special: Women -> Tops -> Crop/Tank -> Party
            } else if (gender === "Women" && cat === "Tops" && sub === "Crop/Tank" && s.style === "Party") {
              clothingItems[styleKey] = [
                { id: `${styleKey}-1`, name: "sequined_crop_party.glb", image: hh }, // ✅ real GLB
                { id: `${styleKey}-2`, name: `${s.outfit} (Option 2)`, image: hh },
                { id: `${styleKey}-3`, name: `${s.outfit} (Option 3)`, image: hh },
                { id: `${styleKey}-4`, name: `${s.outfit} (Option 4)`, image: hh },
                { id: `${styleKey}-5`, name: `${s.outfit} (Option 5)`, image: hh },
              ];
            } else {
              clothingItems[styleKey] = [
                { id: `${styleKey}-1`, name: s.outfit, image: hh },
                { id: `${styleKey}-2`, name: `${s.outfit} (Option 2)`, image: hh },
                { id: `${styleKey}-3`, name: `${s.outfit} (Option 3)`, image: hh },
                { id: `${styleKey}-4`, name: `${s.outfit} (Option 4)`, image: hh },
                { id: `${styleKey}-5`, name: `${s.outfit} (Option 5)`, image: hh },
              ];
            }
          }

          const sizes =
            (gender === "Women" && WOMEN_SIZE_GUIDES[styleKey]) ||
            SIZE_TABLES[s.sizeRef] ||
            ["XS", "S", "M", "L", "XL", "XXL"];

          sizeChart[gender][styleKey] =
            gender === "Women" && WOMEN_SIZE_GUIDES[styleKey]
              ? sizes
              : sizes.map((x) => `${x} — ${s.sizeRef}`);
        });
      });
    });
  });

  return { categories, subcategories, subSubcategories, clothingItems, sizeChart };
}

export const CATALOG = buildCatalogData();
