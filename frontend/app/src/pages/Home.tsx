import MainLayout from "../layouts/MainLayout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageProvider";

function Home() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <Helmet>
        <title>{t("home")}</title>
      </Helmet>

    </MainLayout>
  );
}

export default Home;