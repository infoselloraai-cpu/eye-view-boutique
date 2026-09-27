import sunglasses from "@/assets/sunglasses.jpg";
import eyeglasses from "@/assets/eyeglasses.jpg";
import bluelight from "@/assets/bluelight.jpg";

// Placeholder catalog — replace with API data later (same shape).
export type Category = "Eyeglasses" | "Sunglasses" | "Blue Light";
export type Gender = "Men" | "Women" | "Unisex";
export type Shape = "Rectangle" | "Round" | "Square" | "Aviator" | "Cat Eye";

export interface Product {
  id: string;
  name: string;
  category: Category;
  gender: Gender;
  shape: Shape;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  images: string[];
  isNew?: boolean;
  description: string;
}

const C = {
  black: { name: "Black", hex: "#1a1a1a" },
  brown: { name: "Tortoise", hex: "#8b5a2b" },
  gold: { name: "Gold", hex: "#c9a84c" },
  silver: { name: "Silver", hex: "#c0c0c0" },
  green: { name: "Green", hex: "#2f5233" },
  blue: { name: "Navy", hex: "#1e3a8a" },
  pink: { name: "Rose", hex: "#e8a0b0" },
};

const img = { Sunglasses: sunglasses, Eyeglasses: eyeglasses, "Blue Light": bluelight };

const raw: Omit<Product, "images" | "description">[] = [
  { id: "aviator-classic", name: "Aviator Classic", category: "Sunglasses", gender: "Unisex", shape: "Aviator", price: 4500, oldPrice: 6000, rating: 4.5, reviews: 124, colors: [C.black, C.brown, C.gold, C.silver] },
  { id: "urban-square", name: "Urban Square", category: "Eyeglasses", gender: "Men", shape: "Square", price: 3800, rating: 4, reviews: 88, colors: [C.black, C.silver] },
  { id: "nova-round", name: "Nova Round", category: "Eyeglasses", gender: "Unisex", shape: "Round", price: 3500, oldPrice: 4200, rating: 4.5, reviews: 76, colors: [C.black, C.brown], isNew: true },
  { id: "ocean-blue", name: "Ocean Blue", category: "Blue Light", gender: "Unisex", shape: "Rectangle", price: 4200, rating: 4.5, reviews: 82, colors: [C.blue, C.black] },
  { id: "vertex-black", name: "Vertex Black", category: "Sunglasses", gender: "Men", shape: "Square", price: 5800, oldPrice: 7000, rating: 4, reviews: 110, colors: [C.black, C.green] },
  { id: "willow-clear", name: "Willow Clear", category: "Eyeglasses", gender: "Women", shape: "Round", price: 3200, rating: 4.5, reviews: 94, colors: [C.gold, C.pink], isNew: true },
  { id: "luna-cat", name: "Luna Cat Eye", category: "Sunglasses", gender: "Women", shape: "Cat Eye", price: 5200, oldPrice: 6500, rating: 5, reviews: 58, colors: [C.black, C.pink, C.brown], isNew: true },
  { id: "pixel-guard", name: "Pixel Guard", category: "Blue Light", gender: "Unisex", shape: "Square", price: 2900, oldPrice: 3500, rating: 4, reviews: 140, colors: [C.black, C.blue] },
  { id: "metro-rect", name: "Metro Rectangle", category: "Eyeglasses", gender: "Men", shape: "Rectangle", price: 2700, rating: 4, reviews: 63, colors: [C.black, C.silver, C.blue] },
  { id: "sahara-pilot", name: "Sahara Pilot", category: "Sunglasses", gender: "Men", shape: "Aviator", price: 6800, oldPrice: 8200, rating: 4.5, reviews: 47, colors: [C.gold, C.silver] },
  { id: "study-lite", name: "Study Lite", category: "Blue Light", gender: "Women", shape: "Round", price: 2500, rating: 4.5, reviews: 71, colors: [C.pink, C.gold], isNew: true },
  { id: "bold-frame", name: "Bold Frame", category: "Eyeglasses", gender: "Unisex", shape: "Square", price: 4100, oldPrice: 4800, rating: 4, reviews: 39, colors: [C.black, C.brown] },
];

export const products: Product[] = raw.map((p) => ({
  ...p,
  images: [img[p.category], img[p.category], img[p.category]],
  description: `Elevate your style with the ${p.name}. Designed for those who value both fashion and function, featuring premium lenses, 100% UV protection and a lightweight frame for all-day comfort.`,
}));

export const getProduct = (id: string) => products.find((p) => p.id === id);
