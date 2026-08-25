import type { Language } from "../../app/contexts/LanguageContext";

export type SupportTopic = {
  title: string;
  description: string;
};

export type FrequentlyAskedQuestion = {
  question: string;
  answer: string;
  topic: "order" | "payment" | "shipping" | "returns";
};

type SupportContent = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  topicsTitle: string;
  topicsDescription: string;
  topics: Record<FrequentlyAskedQuestion["topic"], SupportTopic>;
  faqTitle: string;
  faqDescription: string;
  noResults: string;
  clearSearch: string;
  contactTitle: string;
  contactDescription: string;
  contactButton: string;
};

export const supportContent: Record<Language, SupportContent> = {
  vi: {
    eyebrow: "TRUNG TÂM HỖ TRỢ",
    title: "QuyDung có thể giúp gì cho bạn?",
    description: "Tìm câu trả lời nhanh về đặt hàng, thanh toán, giao nhận và đổi trả.",
    searchPlaceholder: "Tìm câu hỏi hoặc chủ đề...",
    topicsTitle: "Bạn cần hỗ trợ về vấn đề nào?",
    topicsDescription: "Chọn một chủ đề để xem các câu hỏi liên quan.",
    topics: {
      order: {
        title: "Đặt hàng",
        description: "Tạo, theo dõi và cập nhật đơn hàng.",
      },
      payment: {
        title: "Thanh toán",
        description: "COD, payOS và trạng thái giao dịch.",
      },
      shipping: {
        title: "Giao nhận",
        description: "Thời gian giao và theo dõi hành trình.",
      },
      returns: {
        title: "Đổi trả",
        description: "Điều kiện và quy trình gửi yêu cầu.",
      },
    },
    faqTitle: "Câu hỏi thường gặp",
    faqDescription: "Các thông tin khách hàng thường quan tâm khi mua sắm tại QuyDung.",
    noResults: "Không tìm thấy câu hỏi phù hợp.",
    clearSearch: "Xóa tìm kiếm",
    contactTitle: "Vẫn cần hỗ trợ?",
    contactDescription: "Gửi yêu cầu cho QuyDung và mô tả vấn đề bạn đang gặp phải.",
    contactButton: "Liên hệ QuyDung",
  },
  en: {
    eyebrow: "HELP CENTER",
    title: "How can QuyDung help?",
    description: "Find quick answers about ordering, payment, shipping, and returns.",
    searchPlaceholder: "Search questions or topics...",
    topicsTitle: "What do you need help with?",
    topicsDescription: "Choose a topic to view related questions.",
    topics: {
      order: {
        title: "Orders",
        description: "Place, track, and update your orders.",
      },
      payment: {
        title: "Payments",
        description: "COD, payOS, and transaction statuses.",
      },
      shipping: {
        title: "Shipping",
        description: "Delivery times and shipment tracking.",
      },
      returns: {
        title: "Returns",
        description: "Eligibility and request process.",
      },
    },
    faqTitle: "Frequently asked questions",
    faqDescription: "Common information customers need while shopping at QuyDung.",
    noResults: "No matching questions found.",
    clearSearch: "Clear search",
    contactTitle: "Still need help?",
    contactDescription: "Send QuyDung a request and describe the issue you are experiencing.",
    contactButton: "Contact QuyDung",
  },
};

export const frequentlyAskedQuestions: Record<Language, FrequentlyAskedQuestion[]> = {
  vi: [
    {
      topic: "order",
      question: "Tôi có thể kiểm tra trạng thái đơn hàng ở đâu?",
      answer: "Đăng nhập, mở menu tài khoản và chọn Đơn mua. Bạn có thể theo dõi đơn theo từng trạng thái từ chờ xác nhận đến đã giao.",
    },
    {
      topic: "order",
      question: "Tôi có thể hủy đơn hàng sau khi đặt không?",
      answer: "Bạn có thể hủy khi đơn vẫn đang chờ xác nhận. Khi đơn đã được chuẩn bị hoặc bàn giao cho đơn vị vận chuyển, hãy gửi yêu cầu hỗ trợ.",
    },
    {
      topic: "payment",
      question: "QuyDung hỗ trợ những phương thức thanh toán nào?",
      answer: "Bạn có thể thanh toán khi nhận hàng (COD) hoặc chuyển khoản online qua cổng payOS bằng mã VietQR.",
    },
    {
      topic: "payment",
      question: "Tôi đã chuyển khoản nhưng đơn vẫn chưa được xác nhận?",
      answer: "Giao dịch ngân hàng có thể cần một khoảng thời gian ngắn để đồng bộ. Hãy kiểm tra lại trạng thái đơn; nếu vẫn chưa cập nhật, gửi mã đơn hàng cho bộ phận hỗ trợ.",
    },
    {
      topic: "shipping",
      question: "Thời gian giao hàng dự kiến là bao lâu?",
      answer: "Thời gian giao phụ thuộc khu vực nhận hàng và tình trạng sản phẩm. Trạng thái mới nhất luôn được cập nhật trong mục Đơn mua.",
    },
    {
      topic: "shipping",
      question: "Tôi có thể đổi địa chỉ nhận hàng không?",
      answer: "Bạn nên cập nhật địa chỉ trước khi đặt hàng. Với đơn đang chờ xác nhận, hãy liên hệ hỗ trợ sớm để được kiểm tra khả năng thay đổi.",
    },
    {
      topic: "returns",
      question: "Làm thế nào để yêu cầu trả hàng?",
      answer: "Mở đơn đã giao trong mục Đơn mua, chọn yêu cầu trả hàng và cung cấp lý do cùng hình ảnh liên quan. QuyDung sẽ kiểm tra trước khi xác nhận.",
    },
    {
      topic: "returns",
      question: "Khi nào tôi nhận được tiền hoàn?",
      answer: "Sau khi yêu cầu được chấp thuận và hàng hoàn được kiểm tra, tiền sẽ được xử lý theo phương thức thanh toán ban đầu. Thời gian nhận tiền phụ thuộc ngân hàng.",
    },
  ],
  en: [
    {
      topic: "order",
      question: "Where can I check my order status?",
      answer: "Sign in, open the account menu, and select My purchases. You can track each order from pending confirmation through delivery.",
    },
    {
      topic: "order",
      question: "Can I cancel an order after placing it?",
      answer: "You can cancel while the order is still pending confirmation. If preparation or shipping has started, please send a support request.",
    },
    {
      topic: "payment",
      question: "Which payment methods does QuyDung support?",
      answer: "You can pay cash on delivery (COD) or make an online bank transfer through payOS using VietQR.",
    },
    {
      topic: "payment",
      question: "I transferred payment, but my order is not confirmed yet.",
      answer: "Bank transactions may take a short time to synchronize. Check the order status again, then send your order number to support if it remains unchanged.",
    },
    {
      topic: "shipping",
      question: "How long will delivery take?",
      answer: "Delivery time depends on your location and product availability. The latest status is always shown under My purchases.",
    },
    {
      topic: "shipping",
      question: "Can I change my delivery address?",
      answer: "Update your address before placing an order whenever possible. For an order pending confirmation, contact support promptly so the change can be reviewed.",
    },
    {
      topic: "returns",
      question: "How do I request a return?",
      answer: "Open a delivered order under My purchases, select the return request option, and provide a reason with relevant photos. QuyDung will review it before approval.",
    },
    {
      topic: "returns",
      question: "When will I receive my refund?",
      answer: "After the return is approved and inspected, the refund is processed through the original payment method. Arrival time depends on your bank.",
    },
  ],
};
