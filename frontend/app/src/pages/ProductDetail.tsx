import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/ProductCard";
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
  "white",
  "black",
  "purple",
] as const;

export default function ProductDetail() {
    const { t } = useLanguage();

    const [activeImage, setActiveImage] = useState(productImages[0]);
    const [selectedSize, setSelectedSize] = useState("40x60");
    const [selectedThickness, setSelectedThickness] = useState("8");
    const [selectedColor, setSelectedColor] = useState<(typeof colors)[number]>(colors[0]);
    const [quantity, setQuantity] = useState("1");
    const [activeTab, setActiveTab] = useState<"desc" | "guide">("desc");

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
                <h3 className="text-text text-xl font-semibold mb-2">
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
                <h3 className="text-text text-xl font-semibold mb-2">
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
                <h3 className="text-text text-xl font-semibold mb-2">
                  {t("colors")}
                </h3>

              <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`py-2 px-6 rounded-xl border text-lg font-medium capitalize transition-all ${
                      selectedColor === color
                        ? "bg-primary text-white border-primary"
                        : "bg-bg border-border text-text-secondary hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t(color)}
                  </button>
                ))}
              </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col justify-center lg:flex-row gap-4">

                {/* QUANTITY */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center  h-12 border border-text-tertiary text-text-secondary rounded-md overflow-hidden">

                    <button
                        onClick={() => setQuantity(prev => String(Math.max(1, Number(prev) - 1)))}
                        className="w-12 h-full flex items-center justify-center hover:bg-primary/10 cursor-pointer"
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
                        className="w-12 h-full flex items-center justify-center hover:bg-primary/10 cursor-pointer"
                    >
                        <Plus size={20} />
                    </button>
                    </div>
                </div>
                
                {/* ADD CART */}
                <button className="flex-1 flex items-center justify-center gap-2 text-primary bg-bg border border-primary rounded-md hover:bg-primary/10 cursor-pointer">
                  <ShoppingCart size={22} />
                  {t("addToCart")}
                </button>

                {/* BUY NOW */}
                <button className="flex-1 text-white font-medium rounded-md bg-red-600 hover:bg-red-700 cursor-pointer">
                  {t("buy")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRODUCT TABS ===== */}
        <section className="mt-14">

          {/* TAB BUTTONS */}
          <div className="flex justify-center mb-6">
            <div className="flex border border-border rounded-xl overflow-hidden">

              <button
                onClick={() => setActiveTab("desc")}
                className={`px-6 py-3 text-base font-medium transition-colors cursor-pointer ${
                  activeTab === "desc"
                    ? "bg-primary text-white"
                    : "bg-bg text-text-secondary hover:text-primary"
                }`}
              >
                {t("description")}
              </button>

              <button
                onClick={() => setActiveTab("guide")}
                className={`px-6 py-3 text-base font-medium transition-colors cursor-pointer ${
                  activeTab === "guide"
                    ? "bg-primary text-white"
                    : "bg-bg text-text-secondary hover:text-primary"
                }`}
              >
                {t("userGuide")}
              </button>

            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-bg border border-border rounded-xl p-6 lg:p-8">

            {/* ===== DESCRIPTION ===== */}
            {activeTab === "desc" && (
              <div>

                {/* OVERVIEW */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-text mb-4">
                    Overview
                  </h3>

                  <p className="text-lg text-text-secondary leading-relaxed">
                    Cloud Orthopedic Pad được thiết kế với lớp memory foam cao cấp,
                    hỗ trợ tối đa cho cột sống và mang lại cảm giác thoải mái suốt
                    đêm dài. Chất liệu mềm mại, thoáng khí và thân thiện với da giúp
                    nâng cao chất lượng giấc ngủ mỗi ngày.
                  </p>
                </div>

                {/* GENERAL INFO */}
                <div>
                  <h3 className="text-2xl font-semibold text-text mb-4">
                    Thông tin chung
                  </h3>

                  <div className="space-y-3 text-lg text-text-secondary">

                    <div className="flex gap-3">
                      <span className="font-semibold text-text">SKU:</span>
                      <span>ORT-CLD-001</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-semibold text-text">
                        Chất liệu:
                      </span>
                      <span>Premium Memory Foam</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-semibold text-text">
                        Xuất xứ:
                      </span>
                      <span>Việt Nam</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-semibold text-text">
                        Thương hiệu:
                      </span>
                      <span>QuyDung Bedding</span>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ===== USER GUIDE ===== */}
            {activeTab === "guide" && (
              <div className="space-y-8">

                <div>
                  <h3 className="text-2xl font-semibold text-text mb-4">
                    Hướng dẫn sử dụng và bảo quản
                  </h3>

                  <p className="text-lg text-text-secondary leading-relaxed">
                    Đệm bông ép là vật dụng quen thuộc trong phòng ngủ của mỗi gia đình.
                    Tuổi thọ của đệm phụ thuộc vào cách sử dụng và bảo quản đúng cách.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-text mb-3">
                    Hướng dẫn sử dụng
                  </h4>

                  <ul className="space-y-2 list-disc pl-5 text-lg text-text-secondary">
                    <li>Đặt đệm trên bề mặt phẳng và khô ráo.</li>
                    <li>Không đặt gần nguồn nhiệt hoặc nơi ẩm thấp.</li>
                    <li>Đảo chiều đệm định kỳ để tăng tuổi thọ.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-text mb-3">
                    Hướng dẫn bảo quản
                  </h4>

                  <ul className="space-y-2 list-disc pl-5 text-lg text-text-secondary">
                    <li>Bảo quản nơi thông thoáng khi không sử dụng.</li>
                    <li>Không dùng hóa chất mạnh để vệ sinh.</li>
                    <li>Vệ sinh định kỳ 6-8 tháng / lần.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-text mb-3">
                    Vỏ đệm
                  </h4>

                  <p className="text-lg text-text-secondary leading-relaxed">
                    Có thể tháo rời để giặt tay hoặc giặt máy ở chế độ nhẹ dưới 30°C.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-text mb-3">
                    Lõi đệm
                  </h4>

                  <p className="text-lg text-text-secondary leading-relaxed">
                    Không dùng vật sắc nhọn hoặc hóa chất mạnh tác động trực tiếp lên
                    lõi đệm để tránh hư hại cấu trúc foam.
                  </p>
                </div>

              </div>
            )}

          </div>
        </section>

        {/* ===== RELATED PRODUCTS ===== */}
        <section className="mt-14 mb-8">

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