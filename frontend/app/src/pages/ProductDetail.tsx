import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button/Button";
import { useLanguage } from "../contexts/LanguageProvider";

const productImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=900&auto=format&fit=crop",
];

const relatedProducts = [
  {
    id: 1,
    title: "Linen Duvet Set",
    price: 189,
    originalPrice: 270,
    discount: "-30%",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600",
    category: "Linen Collection",
    numberSizes: 3,
    numberColors: 5,
  },
  {
    id: 2,
    title: "Cloud Orthopedic Pad",
    price: 320,
    originalPrice: 450,
    discount: "-30%",
    image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600",
    category: "Mattress Technology",
    numberSizes: 4,
    numberColors: 6,
  },
  {
    id: 3,
    title: "Silk Pillowcase",
    price: 45,
    originalPrice: 65,
    discount: "-30%",
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600",
    category: "Silk Collection",
    numberSizes: 2,
    numberColors: 3,
  },
  {
    id: 4,
    title: "Cloud Orthopedic Pad",
    price: 320,
    originalPrice: 450,
    discount: "-30%",
    image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600",
    category: "Mattress Technology",
    numberSizes: 4,
    numberColors: 6,
  },
];

const sizes = ["40x60", "50x70", "60x80"];

const thickness = ["8", "10", "12"];

const colors = [
  "bg-gray-200",
  "bg-blue-500",
  "bg-pink-400",
  "bg-black",
];

export default function ProductDetail() {
    const { t } = useLanguage();

    const [activeImage, setActiveImage] = useState(productImages[0]);
    const [selectedSize, setSelectedSize] = useState("40x60");
    const [selectedThickness, setSelectedThickness] = useState("8");
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [quantity, setQuantity] = useState("1");

    const handleQuantityChange = (value: string) => {
            if (value === "") {
                setQuantity("");
                return;
            }

            if (/^\d+$/.test(value)) {
                setQuantity(value);
            }
        };

  return (
    <MainLayout>
      <Helmet>
        <title>Cloud Orthopedic Pad</title>
      </Helmet>

      <main className="max-w-7xl mx-auto px-3 lg:px-8 py-3">

        {/* ===== BREADCRUMB ===== */}
        <nav className="flex items-center text-text-secondary text-base mb-3">
          <Link to="/" className="hover:text-primary">
            {t("home")}
          </Link>

          <span className="mx-2 text-lg">›</span>

          <Link to="/mattress" className="hover:text-primary">
            {t("mattress")}
          </Link>

          <span className="mx-2 text-lg">›</span>

          <span className="text-text font-medium">
            Cloud Orthopedic Pad
          </span>
        </nav>

        {/* ===== TOP SECTION ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ===== LEFT IMAGES ===== */}
          <div>

            {/* MAIN IMAGE */}
            <div className="rounded-2xl overflow-hidden border border-border bg-bg">
              <img
                src={activeImage}
                alt="Product"
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex items-center gap-3 mt-4 overflow-x-auto hide-scrollbar">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ===== RIGHT INFO ===== */}
          <div>

            <p className="text-primary font-semibold mb-2">
              Mattress Technology
            </p>

            <h1 className="text-3xl lg:text-5xl font-semibold text-text tracking-tight mb-4">
              Cloud Orthopedic Pad
            </h1>

            {/* PRICE */}
            <div className="flex items-end gap-4 mb-6">
              <span className="text-3xl lg:text-4xl font-bold text-red-600">
                529.000đ
              </span>

              <span className="text-xl text-text-tertiary line-through">
                750.000đ
              </span>

              <span className="bg-primary/10 px-2 py-0.5 rounded-lg text-base font-semibold text-primary">
                -30%
              </span>
            </div>

            {/* ===== OPTION BOX ===== */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-5">

              {/* SIZE */}
              <div className="mb-6">
                <h3 className="text-text text-xl font-semibold mb-3">
                  {t("size")} (cm)
                </h3>

                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-6 rounded-xl border text-lg font-medium transition-all ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary"
                          : "bg-bg border-border text-text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* THICKNESS */}
              <div className="mb-6">
                <h3 className="text-text text-xl font-semibold mb-3">
                  {t("thickness")} (cm)
                </h3>

                <div className="flex flex-wrap gap-3">
                  {thickness.map(item => (
                    <button
                      key={item}
                      onClick={() => setSelectedThickness(item)}
                      className={`py-2 px-6 rounded-xl border text-lg font-medium transition-all ${
                        selectedThickness === item
                          ? "bg-primary text-white border-primary"
                          : "bg-bg border-border text-text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLORS */}
              <div className="mb-8">
                <h3 className="text-text text-xl font-semibold mb-3">
                  {t("colors")}
                </h3>

                <div className="flex gap-4">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${color} ${
                        selectedColor === color
                          ? "border-primary scale-110"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col justify-center lg:flex-row gap-4">

                {/* QUANTITY */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center  h-12 border border-text-tertiary text-text-secondary rounded-xl overflow-hidden">

                    <button
                        onClick={() => setQuantity(prev => String(Math.max(1, Number(prev) - 1)))}
                        className="w-12 h-full flex items-center justify-center hover:bg-primary/10"
                    >
                        <Minus size={20} />
                    </button>

                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        onBlur={() => {
                            if (quantity === "" || Number(quantity) < 1) {
                            setQuantity("1");
                            }
                        }}
                        className="w-15 h-full text-center text-lg font-semibold border-x border-text-tertiary bg-transparent outline-none appearance-none"
                    />

                    <button
                        onClick={() => setQuantity(prev => String(Number(prev) + 1))}
                        className="w-12 h-full flex items-center justify-center hover:bg-primary/10"
                    >
                        <Plus size={20} />
                    </button>
                    </div>
                </div>
                
                {/* ADD CART */}
                <Button variant="outline" size="lg" className="flex-1 hover:!bg-primary/10">
                  <ShoppingCart size={22} />
                  {t("addToCart")}
                </Button>

                {/* BUY NOW */}
                <Button size="lg" className="flex-1 !text-white !font-medium !bg-red-600 hover:!bg-red-700">
                  {t("buy")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DESCRIPTION ===== */}
        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-text mb-5">
            {t("productDesc")}
          </h2>

          <div className="bg-bg border border-border rounded-2xl p-6">
            <p className="text-text-secondary leading-relaxed text-lg">
              Cloud Orthopedic Pad được thiết kế với lớp memory foam cao cấp,
              hỗ trợ tối đa cho cột sống và mang lại cảm giác thoải mái suốt
              đêm dài. Chất liệu mềm mại, thoáng khí và thân thiện với da giúp
              nâng cao chất lượng giấc ngủ mỗi ngày.
            </p>
          </div>
        </section>

        {/* ===== RELATED PRODUCTS ===== */}
        <section className="mt-16 mb-8">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-text">
              {t("relatedProducts")}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {relatedProducts.map(product => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        </section>
      </main>
    </MainLayout>
  );
}