import AccountCenter, {
  type AccountSection,
} from "../features/account/components/AccountCenter";

type AccountPageProps = {
  section?: AccountSection;
};

export default function AccountPage({ section }: AccountPageProps) {
  return <AccountCenter section={section} />;
}
