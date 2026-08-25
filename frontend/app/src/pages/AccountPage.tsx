import AccountCenter, {
  type AccountSection,
} from "../features/account/components/AccountCenter";
import type { PurchaseFilter } from "../features/account/components/PurchaseList";

type AccountPageProps = {
  section?: AccountSection;
  purchaseFilter?: PurchaseFilter;
};

export default function AccountPage({ section, purchaseFilter }: AccountPageProps) {
  return <AccountCenter section={section} purchaseFilter={purchaseFilter} />;
}
