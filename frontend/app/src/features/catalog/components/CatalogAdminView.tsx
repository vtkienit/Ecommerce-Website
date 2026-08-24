import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { Boxes, LoaderCircle, Package, Tags } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import MainLayout from "../../../shared/layouts/MainLayout";
import { getStoredUser } from "../../auth/model/authSession";
import { getAdminCategories, getAdminProducts } from "../api/catalogAdminApi";
import type { AdminProduct } from "../model/catalogAdminTypes";
import type { Category } from "../model/catalogTypes";
import CategoryManager from "./CategoryManager";
import ProductManager from "./ProductManager";

type Tab = "products" | "categories";

export default function CatalogAdminView() {
  const { t } = useLanguage();
  const user = getStoredUser();
  const [tab, setTab] = useState<Tab>("products");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role.toLowerCase() !== "admin") return;

    let active = true;
    Promise.all([getAdminCategories(), getAdminProducts()])
      .then(([categoryData, productData]) => {
        if (!active) return;
        setCategories(categoryData);
        setProducts(productData);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("catalogAdminError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t, user?.role]);

  if (!user) return <Navigate to="/login?returnTo=/admin/catalog" replace />;
  if (user.role.toLowerCase() !== "admin") return <Navigate to="/" replace />;

  const showMessage = (message: string, isError = false) => {
    setError(isError ? message : "");
    setSuccess(isError ? "" : message);
  };

  const updateCategories = (next: Category[]) => {
    setCategories(next);
    setProducts((current) => current.map((product) => {
      const category = next.find((item) => item.id === product.categoryId);
      return category ? { ...product, categoryName: category.name } : product;
    }));
  };

  const updateProducts = (next: AdminProduct[]) => {
    setProducts(next);
    setCategories((current) => current.map((category) => ({
      ...category,
      productCount: next.filter((product) => product.categoryId === category.id).length,
    })));
  };

  return (
    <MainLayout>
      <Helmet><title>{t("catalogManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[65vh] bg-bg-subtle px-3 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-semibold text-text md:text-4xl">
              <Package className="text-primary" /> {t("catalogManagement")}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">{t("catalogManagementDescription")}</p>
          </header>

          <div className="mt-7 inline-flex rounded-lg border border-border bg-bg p-1 shadow-sm">
            <TabButton active={tab === "products"} onClick={() => setTab("products")}>
              <Boxes size={17} /> {t("productsLabel")}
            </TabButton>
            <TabButton active={tab === "categories"} onClick={() => setTab("categories")}>
              <Tags size={17} /> {t("categories")}
            </TabButton>
          </div>

          {error && <p className="mt-5 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          {success && <p className="mt-5 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}

          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={21} /> {t("catalogAdminLoading")}
            </div>
          ) : (
            <div className="mt-6">
              {tab === "products" ? (
                <ProductManager
                  categories={categories}
                  products={products}
                  onChange={updateProducts}
                  onMessage={showMessage}
                />
              ) : (
                <CategoryManager
                  categories={categories}
                  onChange={updateCategories}
                  onMessage={showMessage}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${active ? "bg-primary text-white" : "text-text-secondary hover:text-primary"}`}
    >
      {children}
    </button>
  );
}
