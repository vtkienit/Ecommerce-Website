import { Helmet } from "react-helmet-async";
import {
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage, type Language } from "../app/contexts/LanguageContext";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
  ZALO_CONTACT_URL,
} from "../shared/constants/contact";
import MainLayout from "../shared/layouts/MainLayout";

const contactContent = {
  vi: {
    eyebrow: "LIÊN HỆ QUYDUNG",
    title: "Chúng tôi luôn sẵn sàng lắng nghe",
    description: "Cho QuyDung biết bạn cần hỗ trợ gì. Thông tin càng chi tiết sẽ giúp việc xử lý nhanh hơn.",
    emailLabel: "Email hỗ trợ",
    emailValue: SUPPORT_EMAIL,
    phoneLabel: "Hotline",
    phoneValue: SUPPORT_PHONE_DISPLAY,
    introEyebrow: "VỀ QUYDUNG",
    introTitle: "Chăm chút cho từng giấc ngủ ngon",
    introDescription: "QuyDung mang đến những sản phẩm phòng ngủ thoải mái, thẩm mỹ và phù hợp với nhu cầu của từng gia đình. Chúng tôi luôn sẵn sàng lắng nghe, tư vấn và đồng hành cùng bạn trước và sau khi mua hàng.",
    zaloLabel: "Tư vấn nhanh qua Zalo",
    zaloDescription: "Nhắn tin trực tiếp để được tư vấn sản phẩm, kiểm tra đơn hàng hoặc hỗ trợ nhanh chóng.",
    zaloButton: "Nhắn tin Zalo",
    hoursLabel: "Thời gian hỗ trợ",
    hoursValue: "Thứ 2 - Chủ nhật, 8:00 - 22:00",
    addressLabel: "Khu vực phục vụ",
    addressValue: "Giao hàng toàn quốc",
    faqPrompt: "Có thể câu trả lời đã có sẵn",
    faqLink: "Xem trung tâm hỗ trợ",
  },
  en: {
    eyebrow: "CONTACT QUYDUNG",
    title: "We are always ready to listen",
    description: "Tell QuyDung how we can help. More detail helps us resolve your request faster.",
    emailLabel: "Support email",
    emailValue: SUPPORT_EMAIL,
    phoneLabel: "Hotline",
    phoneValue: SUPPORT_PHONE_DISPLAY,
    introEyebrow: "ABOUT QUYDUNG",
    introTitle: "Thoughtful care for better sleep",
    introDescription: "QuyDung offers comfortable and carefully selected bedroom products for every home. We are ready to listen, advise and support you before and after every purchase.",
    zaloLabel: "Chat with us on Zalo",
    zaloDescription: "Message us directly for product advice, order updates or prompt customer support.",
    zaloButton: "Open Zalo chat",
    hoursLabel: "Support hours",
    hoursValue: "Monday - Sunday, 8:00 AM - 10:00 PM",
    addressLabel: "Service area",
    addressValue: "Nationwide delivery",
    faqPrompt: "Your answer may already be available",
    faqLink: "Visit the help center",
  },
} satisfies Record<Language, Record<string, unknown>>;

export default function ContactPage() {
  const { lang } = useLanguage();
  const content = contactContent[lang];

  return (
    <MainLayout>
      <Helmet>
        <title>{content.eyebrow} | QuyDung</title>
      </Helmet>

      <main className="bg-bg-secondary">
        <section className="relative overflow-hidden border-b border-border bg-bg px-3 py-14 md:py-20">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary">
              <Headphones size={15} />
              {content.eyebrow}
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-text md:text-5xl">{content.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">{content.description}</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-3 py-10 md:px-6 md:py-14">
          <section className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm">
              <div className="border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary">
                  <Sparkles size={16} />
                  {content.introEyebrow}
                </span>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-text md:text-3xl">{content.introTitle}</h2>
                <p className="mt-3 leading-7 text-text-secondary">{content.introDescription}</p>
              </div>

              <div className="p-4 md:p-6">
                <div className="rounded-xl bg-primary p-5 text-white shadow-sm md:p-6">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <MessageCircle size={23} />
                    </span>
                    <div>
                      <h3 className="font-bold">{content.zaloLabel}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/80">{content.zaloDescription}</p>
                    </div>
                  </div>
                  <a
                    href={ZALO_CONTACT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md active:translate-y-0"
                  >
                    <MessageCircle size={18} />
                    {content.zaloButton} · {SUPPORT_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </article>

            <div className="space-y-4">
              <ContactInfo icon={Mail} label={content.emailLabel} value={content.emailValue} href={`mailto:${content.emailValue}`} />
              <ContactInfo icon={PhoneCall} label={content.phoneLabel} value={content.phoneValue} href={`tel:${SUPPORT_PHONE}`} />
              <ContactInfo icon={Clock3} label={content.hoursLabel} value={content.hoursValue} />
              <ContactInfo icon={MapPin} label={content.addressLabel} value={content.addressValue} />

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <MessageSquareText className="mt-0.5 shrink-0 text-primary" size={22} />
                  <div>
                    <p className="font-semibold text-text">{content.faqPrompt}</p>
                    <Link to="/support" className="mt-2 inline-flex cursor-pointer font-semibold text-primary transition hover:text-primary/80">
                      {content.faqLink}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}

type ContactInfoProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
};

function ContactInfo({ icon: Icon, label, value, href }: ContactInfoProps) {
  const valueElement = href
    ? <a href={href} className="cursor-pointer font-semibold text-text transition hover:text-primary">{value}</a>
    : <p className="font-semibold text-text">{value}</p>;

  return (
    <article className="flex items-start gap-4 rounded-xl border border-border bg-bg p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={21} />
      </span>
      <div>
        <p className="mb-1 text-sm text-text-secondary">{label}</p>
        {valueElement}
      </div>
    </article>
  );
}
