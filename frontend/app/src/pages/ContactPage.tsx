import { useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import {
  BadgeCheck,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Send,
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

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  orderNumber: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  topic: "order",
  orderNumber: "",
  message: "",
};

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
    formEyebrow: "GỬI YÊU CẦU",
    formTitle: "Bạn đang cần hỗ trợ?",
    formDescription: "Điền thông tin bên dưới. Sau khi xác nhận, ứng dụng email trên thiết bị sẽ mở để bạn gửi yêu cầu.",
    name: "Họ và tên",
    namePlaceholder: "Nhập họ và tên của bạn",
    email: "Email",
    emailPlaceholder: "Nhập địa chỉ email",
    phone: "Số điện thoại",
    phonePlaceholder: "Nhập số điện thoại (không bắt buộc)",
    topic: "Chủ đề",
    orderNumber: "Mã đơn hàng",
    orderNumberPlaceholder: "Ví dụ: QD-123456 (không bắt buộc)",
    message: "Nội dung cần hỗ trợ",
    messagePlaceholder: "Mô tả chi tiết vấn đề bạn đang gặp phải...",
    submit: "Chuẩn bị email hỗ trợ",
    success: "Nội dung đã sẵn sàng. Hãy xác nhận gửi trong ứng dụng email của bạn.",
    note: "QuyDung không tự động tải thông tin lên máy chủ từ biểu mẫu này.",
    required: "Trường này là bắt buộc.",
    invalidName: "Vui lòng nhập họ tên gồm ít nhất 2 ký tự.",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
    invalidPhone: "Số điện thoại chưa đúng định dạng.",
    invalidMessage: "Vui lòng mô tả vấn đề bằng ít nhất 10 ký tự.",
    faqPrompt: "Có thể câu trả lời đã có sẵn",
    faqLink: "Xem trung tâm hỗ trợ",
    topics: {
      order: "Đơn hàng",
      payment: "Thanh toán",
      shipping: "Giao nhận",
      return: "Đổi trả",
      product: "Thông tin sản phẩm",
      other: "Khác",
    },
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
    formEyebrow: "SEND A REQUEST",
    formTitle: "How can we help?",
    formDescription: "Complete the details below. Your email app will open after confirmation so you can send the request.",
    name: "Full name",
    namePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "Enter your email address",
    phone: "Phone number",
    phonePlaceholder: "Enter your phone number (optional)",
    topic: "Topic",
    orderNumber: "Order number",
    orderNumberPlaceholder: "Example: QD-123456 (optional)",
    message: "How can we help?",
    messagePlaceholder: "Describe the issue you are experiencing...",
    submit: "Prepare support email",
    success: "Your message is ready. Confirm sending it in your email application.",
    note: "QuyDung does not automatically upload this form's information to a server.",
    required: "This field is required.",
    invalidName: "Please enter a name with at least 2 characters.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone: "Please enter a valid phone number.",
    invalidMessage: "Please describe the issue using at least 10 characters.",
    faqPrompt: "Your answer may already be available",
    faqLink: "Visit the help center",
    topics: {
      order: "Orders",
      payment: "Payments",
      shipping: "Shipping",
      return: "Returns",
      product: "Product information",
      other: "Other",
    },
  },
} satisfies Record<Language, Record<string, unknown>>;

export default function ContactPage() {
  const { lang } = useLanguage();
  const content = contactContent[lang];
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = content.invalidName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = content.invalidEmail;
    if (form.phone.trim() && !/^[0-9+().\s-]{8,20}$/.test(form.phone.trim())) nextErrors.phone = content.invalidPhone;
    if (!form.topic) nextErrors.topic = content.required;
    if (form.message.trim().length < 10) nextErrors.message = content.invalidMessage;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const topicLabel = content.topics[form.topic as keyof typeof content.topics];
    const subject = `[QuyDung] ${topicLabel}${form.orderNumber.trim() ? ` - ${form.orderNumber.trim()}` : ""}`;
    const body = [
      `${content.name}: ${form.name.trim()}`,
      `${content.email}: ${form.email.trim()}`,
      form.phone.trim() ? `${content.phone}: ${form.phone.trim()}` : "",
      form.orderNumber.trim() ? `${content.orderNumber}: ${form.orderNumber.trim()}` : "",
      "",
      form.message.trim(),
    ].filter(Boolean).join("\n");

    setSubmitted(true);
    window.location.href = `mailto:${content.emailValue}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const fieldClass = (field: keyof ContactForm) => `w-full rounded-lg border bg-bg px-3.5 py-3 text-text outline-none transition placeholder:text-text-secondary/60 focus:ring-2 ${errors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-border focus:border-primary focus:ring-primary/15"}`;

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

        <div className="mx-auto grid max-w-7xl gap-6 px-3 py-10 md:px-6 md:py-14 lg:grid-cols-[0.85fr_1.35fr]">
          <section className="space-y-4">
            <article className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm">
              <div className="border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary">
                  <Sparkles size={16} />
                  {content.introEyebrow}
                </span>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-text">{content.introTitle}</h2>
                <p className="mt-3 leading-7 text-text-secondary">{content.introDescription}</p>
              </div>

              <div className="p-4">
                <div className="rounded-xl bg-primary p-5 text-white shadow-sm">
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
          </section>

          <section className="rounded-2xl border border-border bg-bg p-5 shadow-sm md:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">{content.formEyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">{content.formTitle}</h2>
            <p className="mt-2 leading-6 text-text-secondary">{content.formDescription}</p>

            {submitted && (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <BadgeCheck className="mt-0.5 shrink-0" size={19} />
                <span>{content.success}</span>
              </div>
            )}

            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
              <FormField label={content.name} error={errors.name} required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder={content.namePlaceholder}
                  className={fieldClass("name")}
                  aria-invalid={Boolean(errors.name)}
                />
              </FormField>
              <FormField label={content.email} error={errors.email} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder={content.emailPlaceholder}
                  className={fieldClass("email")}
                  aria-invalid={Boolean(errors.email)}
                />
              </FormField>
              <FormField label={content.phone} error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder={content.phonePlaceholder}
                  className={fieldClass("phone")}
                  aria-invalid={Boolean(errors.phone)}
                />
              </FormField>
              <FormField label={content.topic} error={errors.topic} required>
                <select
                  value={form.topic}
                  onChange={(event) => updateField("topic", event.target.value)}
                  className={`${fieldClass("topic")} cursor-pointer`}
                  aria-invalid={Boolean(errors.topic)}
                >
                  {Object.entries(content.topics).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label={content.orderNumber} error={errors.orderNumber}>
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(event) => updateField("orderNumber", event.target.value)}
                    placeholder={content.orderNumberPlaceholder}
                    className={fieldClass("orderNumber")}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label={content.message} error={errors.message} required>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder={content.messagePlaceholder}
                    className={`${fieldClass("message")} resize-y`}
                    aria-invalid={Boolean(errors.message)}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0"
                >
                  <Send size={18} />
                  {content.submit}
                </button>
                <p className="mt-3 text-center text-xs leading-5 text-text-secondary">{content.note}</p>
              </div>
            </form>
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

type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
