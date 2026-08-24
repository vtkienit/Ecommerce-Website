import PaymentResultView, {
  type PaymentResultMode,
} from "../features/commerce/components/PaymentResultView";

export default function PaymentResultPage({ mode }: { mode: PaymentResultMode }) {
  return <PaymentResultView mode={mode} />;
}
