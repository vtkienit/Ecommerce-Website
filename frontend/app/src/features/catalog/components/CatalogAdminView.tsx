import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Boxes, LoaderCircle, Package, Tags } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import useDebouncedValue from "../../../shared/hooks/useDebouncedValue";
import { getAdminCategories, getAdminProducts } from "../api/catalogAdminApi";
import type { AdminProduct } from "../model/catalogAdminTypes";
import type { Category } from "../model/catalogTypes";
import CategoryManager from "./CategoryManager";
import ProductManager from "./ProductManager";

type Tab = "products" | "categories";

export default function CatalogAdminView() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("products");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productPage, setProductPage] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [productTotal, setProductTotal] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const debouncedSearch = useDebouncedValue(productSearch);

  useEffect(() => {
    let active = true;
    getAdminCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("catalogAdminError"));
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    let active = true;
    getAdminProducts({ page: productPage, size: 8, search: debouncedSearch })
      .then((data) => {
        if (!active) return;
        setProducts(data.content);
        setProductTotal(data.totalElements);
        setProductTotalPages(data.totalPages);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("catalogAdminError"));
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, productPage, t]);

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
  };

  return (
    <>
      <Helmet><title>{t("catalogManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
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

          {categoriesLoading || productsLoading ? (
            <div className="flex min-h-80 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={21} /> {t("catalogAdminLoading")}
            </div>
          ) : (
            <div className="mt-6">
              {tab === "products" ? (
                <ProductManager
                  categories={categories}
                  products={products}
                  page={productPage}
                  search={productSearch}
                  totalElements={productTotal}
                  totalPages={productTotalPages}
                  onChange={updateProducts}
                  onCountChange={(change) => setProductTotal((current) => Math.max(0, current + change))}
                  onPageChange={setProductPage}
                  onSearchChange={(value) => {
                    setProductSearch(value);
                    setProductPage(0);
                  }}
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
    </>
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
