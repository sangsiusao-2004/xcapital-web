"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
function getVietnamTime() {

  return new Date().toLocaleTimeString(
    "vi-VN",
    {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

}

export default function Home() {
  const [authMode, setAuthMode] = useState(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState("verify");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [goldInput, setGoldInput] = useState("");
  const [chartImage, setChartImage] = useState(null);
  const [chartPreview, setChartPreview] = useState("");
  const [messages, setMessages] = useState([
    
    {
      role: "bot",
      text:
        "Xin chào! Tôi là X-Capital Bot Signals 🤖\n\nTôi có thể giúp bạn phân tích XAUUSD realtime.\n\n📷 Ảnh biểu đồ • 💰 Giá vàng hiện tại • ⏰ Khung thời gian\n\nVui lòng nhập thông tin bên dưới để bắt đầu phân tích.",
    },
  ]);
  useEffect(() => {

    const savedMessages =
      localStorage.getItem(
        "xcap_messages"
      );

    if (savedMessages) {

      setMessages(
        JSON.parse(savedMessages)
      );
    }

  }, []);
  const chatContainerRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [accountTab, setAccountTab] = useState(null);
// profile | settings | plus | help
  const [currentUserName, setCurrentUserName] = useState("bnn");
  const [accountType, setAccountType] = useState("Free");
  const [goldPrice, setGoldPrice] = useState(null);
  const [goldChange, setGoldChange] = useState(null);
  const [goldDirection, setGoldDirection] =
    useState("neutral");
  const [previousPrice, setPreviousPrice] =
  useState(null);
  const [goldSignal, setGoldSignal] = useState("WAIT");
  const [trendPersistence, setTrendPersistence] =
  useState("WAIT");
  const [marketStrength, setMarketStrength] =
    useState(50);

  const [priceHistory, setPriceHistory] =
    useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] =
    useState(false);
  const [analyzeCooldown, setAnalyzeCooldown] =
    useState(0);
  const [signalNotify, setSignalNotify] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [settingMessage, setSettingMessage] = useState("");
  const [settingSuccess, setSettingSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [sendCooldown, setSendCooldown] = useState(0);

  async function handleSendCode() {
    setMessage("");

    if (!email) {
      setMessage("Vui lòng nhập email trước.");
      return;
    }

    try {
      setMessage("Đang gửi mã...");

      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      console.log("SEND CODE RESPONSE:", data);

      if (!res.ok) {
        setMessage(data.message || "Server gửi mã bị lỗi.");
        return;
      }

      if (data.success) {

        setSentCode(String(data.code).trim());

        setMessage("Mã xác thực đã được gửi về email.");

        setSendCooldown(30);

      } else {
        setMessage(data.message || "Không gửi được mã.");
      }
    } catch (error) {
      console.log("SEND CODE ERROR:", error);
      setMessage("Lỗi kết nối server. Kiểm tra API send-code.");
    }
  }

  function handleVerifyCode() {
    if (!code) {
      setMessage("Vui lòng nhập mã xác thực.");
      return;
    }

    if (code === sentCode) {
      setIsVerified(true);
      setMessage("Xác thực email thành công.");
    } else {
      setIsVerified(false);
      setMessage("Mã xác thực không đúng.");
    }
  }

  async function handleSendMessage() {

  if (analyzeCooldown > 0) {

    return;

  }

  if (
    !chartImage ||
    !goldInput ||
    !selectedTimeframe
  ) {
    return;
  }

  setIsAnalyzing(true);

  // USER MESSAGE
  const userMessage = {

    role: "user",

    time: getVietnamTime(),

    image: `data:image/png;base64,${chartImage}`,

    text:
      `💰 Giá vàng hiện tại: ${goldInput}\n` +
      `⏰ Khung thời gian: ${selectedTimeframe}`,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  try {

    // API CALL
    const response = await fetch(
      "/api/analyze",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          image: chartImage,
          goldPrice: goldInput,
          timeframe:
            selectedTimeframe,
        }),
      }
    );

    const data =
      await response.json();

    console.log(data);

    // GEMINI RESPONSE
    const aiText =
      data.message;

    setTypingText(aiText[0] || "");

    let index = 1;

    let isCancelled = false;

    let typingStopped = false;

    const typingInterval =
      setInterval(() => {
        
        if (isCancelled || typingStopped) return;

        setTypingText(
          (prev) =>
            prev + aiText[index]
        );

        index++;

        if (
          index >= aiText.length
        ) {

          clearInterval(
            typingInterval       
          );

          isCancelled = true;

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",

              time: getVietnamTime(),

              text:
                aiText ||
                "AI không phản hồi",
            },
          ]);

          setTypingText("");

          setIsAnalyzing(false);

          setAnalyzeCooldown(90);
        }

      }, 15);
      window.addEventListener(
        "beforeunload",
        () => {
          typingStopped = true;
          clearInterval(typingInterval);
        }
      );

  } catch (error) {

    console.log(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",

        time: getVietnamTime(),

        text:
          "⚠ Không thể kết nối AI.",
      },
    ]);

    setIsAnalyzing(false);
  }

  // RESET FORM
  setChartImage(null);

  setChartPreview("");

  setGoldInput("");

  setSelectedTimeframe("");
}

  async function fetchGoldPrice() {

    try {

      const res = await fetch(
        "https://api.gold-api.com/price/XAU"
      );

      const data = await res.json();

      const price =
        Number(data.price);
        if (Number.isNaN(price)) return;

      let change = 0;

      let direction = "neutral"; 

      if (goldPrice !== null) {

        change = price - goldPrice;

        if (change > 0) {

          direction = "up";

        } else if (change < 0) {

          direction = "down";

        } else {

          direction = "neutral";

        }
      }

      setPreviousPrice(goldPrice);

      setGoldPrice(price);

      setGoldChange(change);

      setGoldDirection(direction);

      setPriceHistory((prev) => {

        const updated = [...prev, price];

        if (updated.length > 12) {
          updated.shift();
        }

        if (updated.length >= 8) {

          const latest =
            updated[updated.length - 1];

          const oldest =
            updated[0];

          const movement =
            latest - oldest;

          const momentum =
            latest -
            updated[updated.length - 2];

          // BUY
          if (
            movement >= 1.2 &&
            momentum > 0
          ) {

            setGoldSignal("BUY");

            setTrendPersistence("BUY");

            setMarketStrength(90);
          }

          // BUY MEDIUM
          else if (
            movement >= 0.5
          ) {

            setGoldSignal("BUY");

            setTrendPersistence("BUY");

            setMarketStrength(75);
          }

          // SELL
          else if (
            movement <= -1.2 &&
            momentum < 0
          ) {

            setGoldSignal("SELL");

            setTrendPersistence("SELL");

            setMarketStrength(90);
          }

          // SELL MEDIUM
          else if (
            movement <= -0.5
          ) {

            setGoldSignal("SELL");

            setTrendPersistence("SELL");

            setMarketStrength(75);
          }

          // WAIT
          else {

            setGoldSignal("WAIT");

            setMarketStrength(45);
          }
        }

        return updated;
      });

    } catch (error) {

      console.log(
        "GOLD API ERROR:",
        error
      );
    }
  }

  useEffect(() => {

    localStorage.setItem(
      "xcap_messages",
      JSON.stringify(messages)
    );

    setTimeout(() => {

      if (chatContainerRef.current) {

        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;

      }

    }, 100);

  }, [messages]);

  
  useEffect(() => {

    if (sendCooldown <= 0) return;

    const timer = setInterval(() => {

      setSendCooldown((prev) => prev - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [sendCooldown]);

  useEffect(() => {

    if (analyzeCooldown <= 0) return;

    const timer = setInterval(() => {

      setAnalyzeCooldown((prev) => prev - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [analyzeCooldown]);

  useEffect(() => {

    return () => {

      if (chartPreview) {
        URL.revokeObjectURL(chartPreview);
      }

    };

  }, [chartPreview]);

  useEffect(() => {

    const savedUser =
      localStorage.getItem("xcap_user");

    if (savedUser) {

      const parsedUser =
        JSON.parse(savedUser);

      setIsLoggedIn(true);

      setEmail(parsedUser.email);

      setCurrentUserName(
        parsedUser.full_name
      );

      setAccountType(
        parsedUser.accountType || "Free"
      );
    }

  }, []);
  
  useEffect(() => {
    fetchGoldPrice();

    const interval = setInterval(() => {
      fetchGoldPrice();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  async function handleChangePasswordFromSettings() {
    setSettingMessage("");
    setSettingSuccess(false);

    if (!email.trim()) {
      setSettingMessage("Không tìm thấy email tài khoản.");
      return;
    }

    if (!oldPassword) {
      setSettingMessage("Vui lòng nhập mật khẩu cũ.");
      return;
    }

    if (!newPassword) {
      setSettingMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      setSettingMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (!confirmNewPassword) {
      setSettingMessage("Vui lòng xác nhận mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSettingMessage("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    const { data: user, error: checkError } = await supabase
      .from("users")
      .select("id,password")
      .eq("email", email.trim().toLowerCase())
      .eq("password", oldPassword)
      .maybeSingle();

    if (checkError) {
      setSettingMessage("Lỗi kiểm tra mật khẩu.");
      return;
    }

    if (!user) {
      setSettingMessage("Mật khẩu cũ không đúng.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email.trim().toLowerCase());

    if (error) {
      setSettingMessage("Không đổi được mật khẩu: " + error.message);
      return;
    }

    setPassword(newPassword);

    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    setSettingSuccess(true);
    setSettingMessage("Đổi mật khẩu thành công.");

    // delay 1.2s rồi ẩn form
    setTimeout(() => {
      setShowChangePassword(false);
      setSettingSuccess(false);
    }, 1200);
  }

  return (
    <main className="h-screen bg-[#050505] text-white relative overflow-hidden">
      <GoldBackground />
      {accountTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-yellow-500/30 bg-[#0b0b0f] p-8 shadow-[0_0_80px_rgba(212,175,55,0.25)]">
            
            <div className="mb-6 flex items-center justify-between border-b border-yellow-500/20 pb-4">
              <h2 className="text-3xl font-bold text-yellow-300">
                {accountTab === "profile" && "👤 Hồ sơ tài khoản"}
                {accountTab === "settings" && "⚙️ Cài đặt hệ thống"}
                {accountTab === "plus" && "✨ X-Capital Plus"}
                {accountTab === "help" && "❔ Trung tâm trợ giúp"}
              </h2>

              <button
                onClick={() => {
                  setAccountTab(null);
                  setShowChangePassword(false);

                  setSettingMessage("");
                  setSettingSuccess(false);

                  setOldPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                className="text-2xl text-yellow-300 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* PROFILE */}
            {accountTab === "profile" && (
              <div className="space-y-5 text-white">
                <div className="flex items-center gap-4 rounded-2xl border border-yellow-500/20 bg-white/5 p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-200 to-yellow-600 text-xl font-bold text-black">
                    {currentUserName?.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-yellow-300">
                      {currentUserName}
                    </h3>
                    <p className="text-sm text-gray-400">{accountType} Account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4">
                    <p className="text-sm text-gray-400">Email đăng nhập</p>
                    <p className="mt-1 text-yellow-200">{email}</p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4">
                    <p className="text-sm text-gray-400">Trạng thái tài khoản</p>
                    <p className="mt-1 text-green-300">Đã xác minh email</p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4">
                    <p className="text-sm text-gray-400">Quyền truy cập</p>
                    <p className="mt-1 text-yellow-200">
                      Chat bot phân tích vàng, xem xu hướng thị trường, lưu lịch sử demo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {accountTab === "settings" && (
              <div className="space-y-5 text-white">
                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-yellow-300">Thông báo tín hiệu</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Bật để nhận cảnh báo khi bot phát hiện xu hướng mới.
                      </p>
                    </div>

                    <button
                      onClick={() => setSignalNotify(!signalNotify)}
                      className={`rounded-full px-5 py-2 font-bold ${
                        signalNotify
                          ? "bg-green-500 text-black"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {signalNotify ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-5">
                  {!showChangePassword ? (
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setSettingMessage("");
                        setSettingSuccess(false);
                      }}
                      className="w-full rounded-xl border border-yellow-400/30 px-4 py-4 text-left font-bold text-yellow-300 hover:bg-yellow-400/10"
                    >
                      🔒 Đổi mật khẩu
                    </button>
                  ) : (
                    <div>
                      <h3 className="mb-4 font-bold text-yellow-300">Đổi mật khẩu</h3>

                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Nhập mật khẩu cũ"
                        className="mb-3 w-full rounded-xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                      />

                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="mb-3 w-full rounded-xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                      />

                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        className="mb-3 w-full rounded-xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                      />

                      {settingMessage && (
                        <p
                          className={`mb-3 rounded-xl px-4 py-3 text-sm ${
                            settingSuccess
                              ? "border border-green-400/30 bg-green-400/10 text-green-300"
                              : "border border-red-400/30 bg-red-400/10 text-red-300"
                          }`}
                        >
                          {settingMessage}
                        </p>
                      )}

                      <button
                        onClick={handleChangePasswordFromSettings}
                        className="w-full rounded-xl bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-600 py-3 font-bold text-black"
                      >
                        Đổi mật khẩu
                      </button>

                      <button
                        onClick={() => {
                          setAccountTab(null);
                          setAuthMode("forgot");
                          setForgotStep("verify");
                          setMessage("");
                          setCode("");
                          setSentCode("");
                          setPassword("");
                          setConfirmPassword("");
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                        }}
                        className="mt-4 w-full text-center text-sm text-yellow-300 hover:text-yellow-100"
                      >
                        Quên mật khẩu?
                      </button>

                      <button
                        onClick={() => {
                          setShowChangePassword(false);
                          setSettingMessage("");
                          setSettingSuccess(false);
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                        }}
                        className="mt-3 w-full text-center text-sm text-gray-400 hover:text-white"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PLUS */}
            {accountTab === "plus" && (
              <div className="space-y-6 text-white">
                <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-400/10 to-yellow-700/10 p-6">
                  <h3 className="mb-3 text-3xl font-bold text-yellow-300">
                    X-Capital Plus
                  </h3>

                  <p className="mb-5 text-gray-300">
                    Mở khóa trải nghiệm cao cấp cho bot phân tích vàng.
                  </p>

                  <ul className="space-y-3 text-sm text-gray-300">
                    <li>✔ Tín hiệu AI ưu tiên nhanh hơn</li>
                    <li>✔ Phân tích đa khung H1 / H4 / D1</li>
                    <li>✔ Gợi ý vùng Entry / TP / SL rõ ràng hơn</li>
                    <li>✔ Ưu tiên hỗ trợ qua Telegram</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setAccountType("Plus");
                    setAccountTab(null);
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-600 py-4 text-lg font-bold text-black shadow-[0_0_30px_rgba(212,175,55,0.35)]"
                >
                  Kích hoạt dùng thử Plus miễn phí
                </button>
              </div>
            )}

            {/* HELP */}
            {accountTab === "help" && (
              <div className="space-y-4 text-white">
                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-5">
                  <h3 className="font-bold text-yellow-300">Cách sử dụng bot</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Gửi ảnh chart XAUUSD, sau đó nhập yêu cầu như: “phân tích H1”,
                    “cho tôi vùng entry”, hoặc “xu hướng hiện tại là gì?”.
                  </p>
                </div>

                <button
                  onClick={() => window.open("https://t.me/ryantranforex", "_blank")}
                  className="w-full rounded-2xl border border-yellow-500/20 p-4 text-left hover:bg-white/5"
                >
                  💬 Liên hệ hỗ trợ Telegram
                </button>

                <button
                  onClick={() => window.open("https://zalo.me/0924137786", "_blank")}
                  className="w-full rounded-2xl border border-yellow-500/20 p-4 text-left hover:bg-white/5"
                >
                  📱 Liên hệ hỗ trợ Zalo
                </button>

                <button className="w-full rounded-2xl border border-yellow-500/20 p-4 text-left hover:bg-white/5">
                  🛠 Báo lỗi hệ thống
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoggedIn && (
        <>
          {accountMenuOpen && (
            <div
              className="
                fixed
                inset-0
                z-[999]
                bg-black/70
                lg:hidden
              "
              onClick={() =>
                setAccountMenuOpen(false)
              }
            >
              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-full
                  w-[82%]

                  overflow-y-auto
                  overflow-hidden

                  border-l
                  border-yellow-500/20

                  p-5

                  bg-[radial-gradient(circle_at_5%_70%,rgba(255,214,100,0.22),transparent_18%),radial-gradient(circle_at_95%_35%,rgba(212,175,55,0.18),transparent_22%),linear-gradient(135deg,#030303,#100d05,#030303)]

                  shadow-[0_0_60px_rgba(212,175,55,0.08)]

                  backdrop-blur-xl
                "
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <div
                  className="
                  relative
                  mb-7
                  px-2
                  pt-1
                  pb-2
                "
                >

                  {/* CONTENT */}

                  <div className="relative z-10">

                    <h1
                      className="
                        leading-none
                        text-yellow-300
                      "
                      style={{
                        fontFamily: "Amoresa",
                        fontSize: "46px",
                        textShadow: `
                          0 0 10px rgba(255,220,120,0.45),
                          0 0 30px rgba(212,175,55,0.28)
                        `,
                      }}
                    >
                      X-Capital
                    </h1>

                    <p
                      className="
                        -mt-1
                        text-white
                      "
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        fontSize: "28px",
                        textShadow: `
                          0 0 10px rgba(255,255,255,0.25)
                        `,
                      }}
                    >
                      Bot Signals
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  <div className="rounded-xl border border-yellow-500/20 bg-black/40 p-4">
                    <p className="text-sm text-gray-400">
                      Giá vàng hiện tại
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-300">
                      {goldPrice || "----"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-yellow-500/20 bg-black/40 p-4">
                    <p className="text-sm text-gray-400">
                      Xu hướng hiện tại
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-300">
                      {goldSignal}
                    </p>
                  </div>

                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-yellow-500/20
                      bg-white/5
                      overflow-hidden
                    "
                  >

                    {/* HEADER */}
                    <button
                      onClick={() =>
                        setMobileProfileOpen(!mobileProfileOpen)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        p-4
                      "
                    >

                      <div className="flex items-center gap-3">

                        {/* AVATAR */}
                        <div
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-r
                            from-yellow-200
                            to-yellow-500
                            text-black
                            font-bold
                          "
                        >
                          {currentUserName?.slice(0,2).toUpperCase()}
                        </div>

                        {/* USER INFO */}
                        <div className="text-left">

                          <h3 className="font-semibold text-white">
                            {currentUserName || "User"}
                          </h3>

                          <p className="text-sm text-gray-400">
                            {accountType}
                          </p>

                        </div>

                      </div>

                      {/* ARROW */}
                      <span
                        className={`
                          text-gray-400
                          text-2xl
                          transition-all
                          duration-300

                          ${
                            mobileProfileOpen
                              ? "rotate-90"
                              : ""
                          }
                        `}
                      >
                        ›
                      </span>

                    </button>

                    {/* DROPDOWN */}
                    <div
                      className={`
                        overflow-hidden
                        transition-all
                        duration-300

                        ${
                          mobileProfileOpen
                            ? "max-h-[500px] opacity-100"
                            : "max-h-0 opacity-0"
                        }
                      `}
                    >

                      <div className="border-t border-white/10 p-3">

                        <div className="space-y-2">

                          {/* PLUS */}
                          <button
                            onClick={() => {

                              setAccountTab("plus");

                              setAccountMenuOpen(false);

                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-4
                              py-3
                              text-left
                              transition
                              hover:bg-yellow-500/10
                            "
                          >
                            <span>✨</span>
                            <span>Nâng cấp gói</span>
                          </button>

                          {/* PROFILE */}
                          <button
                            onClick={() => {

                              setAccountTab("profile");

                              setAccountMenuOpen(false);

                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-4
                              py-3
                              text-left
                              transition
                              hover:bg-yellow-500/10
                            "
                          >
                            <span>👤</span>
                            <span>Hồ sơ</span>
                          </button>

                          {/* SETTINGS */}
                          <button
                            onClick={() => {

                              setAccountTab("settings");

                              setAccountMenuOpen(false);

                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-4
                              py-3
                              text-left
                              transition
                              hover:bg-yellow-500/10
                            "
                          >
                            <span>⚙️</span>
                            <span>Cài đặt</span>
                          </button>

                          {/* HELP */}
                          <button
                            onClick={() => {

                              setAccountTab("help");

                              setAccountMenuOpen(false);

                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-4
                              py-3
                              text-left
                              transition
                              hover:bg-yellow-500/10
                            "
                          >
                            <span>❔</span>
                            <span>Trợ giúp</span>
                          </button>

                        </div>

                        {/* DIVIDER */}
                        <div className="my-4 h-px bg-white/10" />

                        {/* LOGOUT */}
                        <button
                          onClick={() => {

                            localStorage.removeItem(
                              "xcap_user"
                            );

                            setIsLoggedIn(false);

                            setEmail("");

                            setPassword("");

                            setMessage("");

                            setAccountMenuOpen(false);

                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-4
                            py-3
                            text-left
                            text-red-300
                            transition
                            hover:bg-red-500/10
                          "
                        >
                          <span>↪</span>
                          <span>Đăng xuất</span>
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>
           )}
        
        <div
          className="
          relative
          z-20
          h-full
          overflow-hidden
          grid
          grid-cols-1
          bg-black/45
          text-white
          lg:grid-cols-[300px_minmax(0,1fr)_320px]
          min-h-0
          "
          >
          {/* CỘT TRÁI */}
          <aside className="hidden lg:block relative h-full border-r border-yellow-500/20 bg-black/70 p-6 backdrop-blur-md">
            <div className="mb-8">
              <h1
                className="text-4xl leading-none text-yellow-300"
                style={{ fontFamily: "Amoresa" }}
              >
                X-Capital
              </h1>
              <p
                className="text-xl text-white"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Bot Signals
              </p>
            </div>

            <button className="mb-8 w-full rounded-xl bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-600 py-4 font-bold text-black shadow-[0_0_35px_rgba(212,175,55,0.35)]">
              ✨ AI Gold Analysis
            </button>

            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/15 to-yellow-400/5 px-5 py-4 shadow-[0_0_25px_rgba(212,175,55,0.12)]">
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-yellow-200">
                      Chat AI Signals
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      AI phân tích XAUUSD theo chart realtime
                    </p>
                  </div>

                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              {accountMenuOpen && (
                <div className="mb-3 rounded-2xl border border-yellow-500/20 bg-[#1b1b1b] p-3 shadow-[0_0_40px_rgba(0,0,0,0.65)]">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-200 to-yellow-600 text-xs lg:text-sm font-bold text-black">
                      {currentUserName?.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-white">{currentUserName}</p>
                      <p className="text-xs text-gray-400">{accountType}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAccountTab("plus");
                      setAccountMenuOpen(false);
                    }}
                    className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/10"
                  >
                    ✨ Dùng thử Plus miễn phí
                  </button>

                  <button
                    onClick={() => {
                      setAccountTab("profile");
                      setAccountMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/10"
                  >
                    👤 Hồ sơ
                  </button>

                  <button
                    onClick={() => {
                      setAccountTab("settings");
                      setAccountMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/10"
                  >
                    ⚙️ Cài đặt
                  </button>

                  <button
                    onClick={() => {
                      setAccountTab("help");
                      setAccountMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/10"
                  >
                    ❔ Trợ giúp
                  </button>

                  <div className="my-2 border-t border-white/10" />

                  <button
                    onClick={() => {
                      localStorage.removeItem("xcap_user");
                      setIsLoggedIn(false);
                      setAccountMenuOpen(false);
                      setEmail("");
                      setPassword("");
                      setMessage("");
                      setAccountTab(null);
                      setAccountType("Free");
                      setShowChangePassword(false);
                      setSettingMessage("");
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
                  >
                    ↪ Đăng xuất
                  </button>
                </div>
              )}

              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/80 p-3 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-200 to-yellow-600 text-xs lg:text-sm font-bold text-black">
                    {currentUserName?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{currentUserName}</p>
                    <p className="text-xs text-gray-400">{accountType}</p>
                  </div>
                </div>

                <span className="text-gray-400">›</span>
              </button>
            </div>
          </aside>

          {/* KHUNG CHAT GIỮA */}
          <section className="flex h-full min-h-0 overflow-hidden flex-col border-r border-yellow-500/20 bg-black/35">
            <header className="shrink-0 flex flex-col gap-4 border-b border-yellow-500/20 bg-black/55 px-3 py-4 lg:px-6 lg:py-5 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="flex items-center justify-between w-full">

                <div>
                  <h2 className="text-xl font-bold lg:text-2xl">
                    Chat AI Signals
                  </h2>

                  <p className="text-sm text-gray-400">
                    AI phân tích kỹ thuật XAUUSD realtime
                  </p>
                </div>

                {/* MOBILE MENU */}
                <button
                  onClick={() =>
                    setAccountMenuOpen(!accountMenuOpen)
                  }
                  className="
                    flex
                    lg:hidden
                    items-center
                    justify-center
                    w-11
                    h-11
                    rounded-xl
                    border
                    border-yellow-500/20
                    bg-black/50
                    text-yellow-300
                    text-2xl
                  "
                >
                  ☰
                </button>

              </div>
            </header>

            <div
              ref={chatContainerRef}
              className="
                flex-1
                min-h-0
                overflow-y-auto
                overflow-x-hidden

                px-2
                py-3

                lg:px-3
                lg:py-6

                custom-scroll
              "
            >
              <div className="flex w-full flex-col gap-5">
                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={`
                      mb-4
                      flex
                      w-full

                      ${msg.role === "user"
                        ? "justify-end"
                        : "justify-start"}
                    `}
                  >

                    {/* BOT AVATAR LEFT */}
                    {msg.role === "bot" && (

                      <div
                        className="
                          mr-2
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-start
                        "
                      >

                        <img
                          src="/bot.png"
                          alt="bot"
                          className="
                            h-9
                            w-9
                            rounded-full
                            border
                            border-yellow-500/30
                            object-cover
                            shadow-[0_0_20px_rgba(255,215,0,0.35)]
                          "
                        />

                      </div>
                    )}

                    {/* CHAT BOX */}
                    <div
                      className={`
                        w-[98%] sm:w-[92%] lg:w-[50%]
                        overflow-hidden
                        rounded-3xl
                        border
                        border-yellow-500/20
                        backdrop-blur-xl

                        ${msg.role === "bot"
                          ? "bg-gradient-to-br from-[#0f0f0f] to-[#151515] backdrop-blur-xl"
                          : "bg-[#1b1405]/95"
                        }
                      `}
                    >

                      {/* HEADER */}
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          border-b
                          border-yellow-500/10
                          px-2
                          py-2
                          lg:px-3
                          lg:py-3
                        "
                      >

                        {/* LEFT */}
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          {/* AVATAR IN CHAT */}
                          <img
                            src={
                              msg.role === "user"
                                ? "/user.png"
                                : "/bot.png"
                            }
                            alt="avatar"
                            className="
                              h-10
                              w-10
                              rounded-full
                              border
                              border-yellow-500/30
                              object-cover
                            "
                          />

                          {/* NAME */}
                          <div>

                            <h3
                              className="
                                text-base
                                font-semibold
                                text-white
                              "
                            >
                              {msg.role === "user"
                                ? "Bạn"
                                : "X-Capital AI"}
                            </h3>

                            <p
                              className="
                                text-xs
                                text-gray-400
                              "
                            >
                              {msg.role === "user"
                                ? "Trader"
                                : "Professional Trading Bot"}
                            </p>

                          </div>

                        </div>

                        {/* RIGHT */}
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          {msg.role === "bot" && (

                            <span
                              className="
                                hidden
                                sm:block
                                rounded-full
                                bg-yellow-500/20
                                px-2
                                py-1
                                text-[10px]
                                font-bold
                                text-yellow-300
                                lg:px-3
                                lg:text-xs
                              "
                            >
                              AI SIGNAL
                            </span>
                          )}

                          <span
                            className="
                              text-xs
                              text-gray-500
                            "
                          >
                            {msg.time}
                          </span>

                        </div>

                      </div>

                      {/* CONTENT */}
                      <div className="p-4 space-y-4">

                        {/* IMAGE */}
                        {msg.image && (

                          <img
                            src={msg.image}
                            alt="chart"
                            className="
                              max-h-[420px] w-full
                              rounded-2xl
                              border
                              border-white-500/20
                              object-cover
                            "
                          />

                        )}

                        {/* TEXT */}
                        <pre
                          className={`
                            whitespace-pre-wrap
                            font-sans
                            text-[13px] leading-6 lg:text-[15px] lg:leading-8
                            tracking-wide
                            text-gray-100
                          `}
                        >
                          {msg.text}
                        </pre>

                      </div>

                    </div>

                    {/* USER AVATAR RIGHT */}
                    {msg.role === "user" && (

                      <div
                        className="
                          ml-2
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-start
                          justify-center
                        "
                      >

                        <img
                          src="/user.png"
                          alt="user"
                          className="
                            h-9
                            w-9
                            rounded-full
                            border
                            border-yellow-500/30
                            object-cover
                            shadow-[0_0_20px_rgba(255,215,0,0.25)]
                          "
                        />

                      </div>
                    )}

                  </div>
                ))}
                {isAnalyzing && (

                  <div className="max-w-[78%] rounded-2xl border border-yellow-500/20 bg-black/40 px-5 py-4 text-gray-300">

                    <div className="flex items-center gap-3">

                      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />

                      <p className="text-sm">
                        🧠 AI đang phân tích chart XAUUSD...
                      </p>

                    </div>
                  </div>
                )}

                {typingText && (

                  <div className="max-w-[78%] rounded-2xl border border-yellow-500/20 bg-black/40 px-5 py-4 text-gray-100">

                    <p className="whitespace-pre-line leading-7">
                      <>
                        {typingText}

                        <span className="ml-1 animate-pulse text-yellow-400">
                          |
                        </span>
                      </>
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div
              className="
                shrink-0
                border-t
                border-yellow-500/20
                bg-black/80

                backdrop-blur-md
                lg:backdrop-blur-xl

                p-3
                lg:p-5

                z-40
              "
            >
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                
                <label
                  className={`flex h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border transition ${
                    chartImage
                      ? "border-green-400 bg-green-400/10 text-green-300"
                      : "border-yellow-500/20 bg-black/60 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/10"
                  }`}
                >
                  {chartPreview ? (
                    <img
                      src={chartPreview}
                      alt="Chart Preview"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span>📷 Tải ảnh giá vàng</span>
                  )}

                  <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;
                    const reader = new FileReader();

                    reader.readAsDataURL(file);

                    reader.onloadend = () => {

                      const base64 =
                        reader.result.split(",")[1];

                      setChartImage(base64);
                    };

                    if (file) {

                      const imageUrl = URL.createObjectURL(file);

                      setChartPreview(imageUrl);
                    }
                  }}
                />

                </label>
                <input
                  value={goldInput}
                  onChange={(e) => setGoldInput(e.target.value)}
                  placeholder="Giá vàng hiện tại"
                  className="rounded-xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-gray-500 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.18)] focus:border-yellow-300 focus:shadow-[0_0_30px_rgba(250,204,21,0.22)]"
                />

                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="
                    h-[56px]
                    rounded-xl
                    border
                    border-yellow-500/20
                    bg-black/60
                    px-4
                    text-white
                    outline-none
                    transition-all
                    duration-300
                    hover:border-yellow-400
                    hover:shadow-[0_0_20px_rgba(250,204,21,0.18)]
                    focus:border-yellow-300
                    focus:shadow-[0_0_30px_rgba(250,204,21,0.22)]
                    "
                >
                  <option value="">
                    Chọn khung thời gian
                  </option>
                  <option value="M1">M1</option>
                  <option value="M5">M5</option>
                  <option value="M15">M15</option>
                  <option value="H1">H1</option>
                  <option value="H4">H4</option>
                  <option value="D1">D1</option>
                </select>


                <button
                  onClick={handleSendMessage}
                  disabled={
                  isAnalyzing ||
                  analyzeCooldown > 0 ||
                  !chartImage ||
                  !goldInput ||
                  !selectedTimeframe
                }
                  className="
                  w-full
                  h-[56px]
                  rounded-xl
                  bg-gradient-to-r
                  from-yellow-100
                  via-yellow-300
                  to-yellow-600
                  font-bold
                  text-black
                  transition-all
                  duration-300
                  ease-out
                  hover:scale-[1.03]
                  hover:shadow-[0_0_35px_rgba(250,204,21,0.45)]
                  hover:brightness-110
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:scale-100
                  disabled:hover:shadow-none
                  "
                >
                  {isAnalyzing
                    ? "Đang phân tích..."
                    : analyzeCooldown > 0
                      ? `Chờ ${analyzeCooldown}s`
                      : "Gửi phân tích"}
                </button>

              </div>

              <p className="mt-3 text-center text-xs text-gray-500">
                Tín hiệu từ bot chỉ mang tính tham khảo, không phải lời khuyên đầu tư.
              </p>
            </div>
          </section>

          {/* CỘT PHẢI */}
          <aside className="hidden lg:block h-full bg-black/60 p-6 backdrop-blur-md">
            <div className="rounded-2xl border border-yellow-500/20 bg-black/75 p-6 shadow-[0_0_40px_rgba(212,175,55,0.16)]">
              <h3 className="mb-6 font-bold text-yellow-300">
                THÔNG TIN THỊ TRƯỜNG
              </h3>

              <p className="text-lg">XAUUSD</p>
              <p className="text-sm text-gray-400">Gold / U.S. Dollar</p>

              <div
                className={`
                  mt-5
                  text-4xl
                  font-bold
                  transition-all
                  duration-300
                  animate-pulse

                  ${
                    goldDirection === "up"
                      ? "text-green-400 drop-shadow-[0_0_18px_rgba(74,222,128,0.9)]"

                    : goldDirection === "down"
                      ? "text-red-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.9)]"

                    : "text-white"
                  }
                `}
              >
                {goldPrice ? goldPrice.toLocaleString("en-US") : "Đang tải..."}
              </div>

              <p
                className={`mt-1 text-sm ${
                  goldChange > 0
                    ? "text-green-300"

                    : goldChange < 0
                    ? "text-red-300"

                    : "text-white"
                }`}
              >
                {goldChange !== null
                  ? `${goldChange > 0 ? "+" : ""}${goldChange.toFixed(2)}`
                  : "Chưa có dữ liệu"}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black/75 p-6 shadow-[0_0_45px_rgba(212,175,55,0.18)]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-yellow-300">
                  📊 XU HƯỚNG HIỆN TẠI
                </h3>

                <span className="rounded-full border border-yellow-400/30 px-3 py-1 text-xs text-yellow-200">
                  Live
                </span>
              </div>

              <div
                className={`mb-3 text-center text-6xl font-black tracking-wide ${
                  goldSignal === "BUY"
                    ? "text-green-400"
                    : goldSignal === "SELL"
                    ? "text-red-400"
                    : "text-yellow-300"
                }`}
              >
                {goldSignal === "BUY"
                  ? "BUY ↗"
                  : goldSignal === "SELL"
                  ? "SELL ↘"
                  : "WAIT"}
              </div>

              <p className="mb-6 text-center text-sm text-gray-400">
                {goldSignal === "BUY"
                  ? "Giá đang nghiêng về xu hướng tăng. Ưu tiên quan sát vùng mua."
                  : goldSignal === "SELL"
                  ? "Giá đang nghiêng về xu hướng giảm. Ưu tiên quan sát vùng bán."
                  : "Thị trường chưa rõ xu hướng. Nên chờ tín hiệu xác nhận."}
              </p>

              <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className={`
                    h-full
                    rounded-full
                    transition-all
                    duration-500

                    ${
                      goldSignal === "BUY"
                        ? "bg-green-400"

                      : goldSignal === "SELL"
                        ? "bg-red-400"

                      : "bg-yellow-300"
                    }
                  `}
                  style={{
                    width: `${marketStrength}%`,
                    minWidth: "20%",
                  }}
                />

              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trạng thái</span>
                  <span
                    className={
                      goldSignal === "BUY"
                        ? "text-green-300"
                        : goldSignal === "SELL"
                        ? "text-red-300"
                        : "text-yellow-300"
                    }
                  >
                    {goldSignal === "BUY"

                      ? marketStrength >= 85
                        ? "BUY mạnh"

                        : "BUY trung hạn"

                    : goldSignal === "SELL"

                      ? marketStrength >= 85
                        ? "SELL mạnh"

                        : "SELL trung hạn"

                    : "Thị trường sideway"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Biến động</span>
                  <span
                    className={
                      goldDirection === "up"
                        ? "text-green-300"

                        : goldDirection === "down"
                        ? "text-red-300"

                        : "text-yellow-300"
                    }
                  >
                    {goldChange !== null && !Number.isNaN(goldChange)
                      ? `${goldChange > 0 ? "+" : ""}${goldChange.toFixed(2)}`
                      : "Đang cập nhật"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Khung tham khảo</span>
                  <span className="text-yellow-200">XAUUSD Live</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Độ tin cậy</span>
                  <span className="text-yellow-300">
                    {goldSignal === "WAIT"

                      ? "★★★☆☆ 45%"

                      : marketStrength >= 85
                        ? "★★★★★ 90%"

                        : "★★★★☆ 75%"
                    }
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-400/10 p-4 text-xs leading-6 text-gray-300">
                Đây là xu hướng tự động dựa trên biến động giá hiện tại. Không phải lời khuyên đầu tư.
              </div>
            </div>
          </aside>
        </div>
        </>
      )}

      {!isLoggedIn && (
      <div className="relative z-10 min-h-screen">
        <div className="
        absolute
        top-4 lg:top-8
        left-0
        flex
        flex-col
        lg:flex-row
        overflow-hidden
        rounded-r-3xl
        lg:rounded-r-full
        ...
        ">
          <button
            onClick={() => setAuthMode("register")}
            className="bg-gradient-to-r from-[#e9a832] via-[#fff1a8] to-[#f2c75c] text-black px-4 py-3 text-base lg:px-10 lg:py-7 lg:text-3xl hover:brightness-110 transition"
            style={{ fontFamily: "'TT Ramillas', serif", fontWeight: 400 }}
          >
            Đăng Ký
          </button>

          <button
            onClick={() => setAuthMode("login")}
            className="bg-gradient-to-r from-[#fff1a8] via-[#f4d36a] to-[#e9a832] text-black px-4 py-3 text-base lg:px-10 lg:py-7 lg:text-3xl hover:brightness-110 transition"
            style={{ fontFamily: "'TT Ramillas', serif", fontWeight: 400 }}
          >
            Đăng Nhập
          </button>
        </div>

        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1
            className="leading-none text-white"
            style={{
              fontFamily: "Amoresa",
              fontSize: "clamp(54px, 14vw, 290px)",
              fontWeight: 400,
              letterSpacing: "1px",
              textShadow: `
                0 0 5px rgba(255,255,255,1),
                0 0 16px rgba(255,234,150,0.95),
                0 0 42px rgba(212,175,55,0.9),
                0 0 85px rgba(212,175,55,0.6)
              `,
            }}
          >
            X-Capital
          </h1>

          <h2
            className="leading-none text-white -mt-4 lg:-mt-12"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(42px, 7vw, 145px)",
              fontWeight: 400,
              letterSpacing: "0.5px",
              textShadow: `
                0 0 4px rgba(255,255,255,0.95),
                0 0 16px rgba(255,255,255,0.45),
                0 0 32px rgba(255,255,255,0.25)
              `,
            }}
          >
            Bot Signals
          </h2>

          <div
            className="mt-9 rounded-full text-black px-16 py-4"
            style={{
              fontFamily: "'TT Ramillas', serif",
              fontSize: "clamp(24px, 2vw, 38px)",
              fontWeight: 400,
              background:
                "linear-gradient(90deg, #fff1a8 0%, #f4d36a 35%, #e4a536 70%, #d88d1c 100%)",
              boxShadow: `
                0 0 30px rgba(255,210,90,0.65),
                inset 0 1px 6px rgba(255,255,255,0.6)
              `,
            }}
          >
            Bot AI Hỗ Trợ Phân Tích Kỹ Thuật - Tín Hiệu Vàng
          </div>
        </section>

        <div
          className="
          hidden lg:block
          absolute bottom-10 right-0
          rounded-l-full
          ...
          "
          style={{ fontFamily: "'TT Ramillas', serif", fontWeight: 400 }}
        >
          www.x-capital.com 🌐
        </div>
      </div>
      )}

      {authMode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-yellow-500/30 bg-black/90 p-5 lg:p-8 shadow-[0_0_80px_rgba(212,175,55,0.35)]">
            <button
              onClick={() => setAuthMode(null)}
              className="float-right text-yellow-300 text-2xl"
            >
              ×
            </button>

            <h3 className="text-2xl lg:text-4xl font-serif text-yellow-300 text-center mb-8">
              {authMode === "register"
                ? "Đăng Ký"
                : authMode === "forgot"
                ? forgotStep === "verify"
                  ? "Quên Mật Khẩu"
                  : "Tạo Mật Khẩu Mới"
                : "Đăng Nhập"}
            </h3>

            {authMode === "register" && (
              <input
                className="input-gold"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <input
              className="input-gold"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsVerified(false);
                setSentCode("");
              }}
            />

            {(authMode === "register" ||
              (authMode === "forgot" && forgotStep === "verify")) && (
              <div className="flex gap-2">
                <div className="relative flex-[3]">
                  <input
                    className="input-gold w-full pr-20"
                    placeholder="Nhập mã xác thực"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendCooldown > 0}
                  className="
                    mb-[14px]
                    flex-1
                    rounded-xl
                    border
                    border-yellow-400/40
                    text-yellow-300
                    font-semibold
                    hover:bg-yellow-400/10

                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  {sendCooldown > 0
                    ? `${sendCooldown}s`
                    : "Gửi Mã"}
                </button>
              </div>
            )}

            {authMode !== "forgot" || forgotStep === "reset" ? (
              <input
                className="input-gold"
                placeholder={authMode === "forgot" ? "Mật khẩu mới" : "Mật khẩu"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            ) : null}

            {(authMode === "register" ||
              (authMode === "forgot" && forgotStep === "reset")) && (
              <input
                className="input-gold"
                placeholder={
                  authMode === "forgot"
                    ? "Xác nhận mật khẩu mới"
                    : "Xác nhận mật khẩu"
                }
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {message && (
              <div className="mb-4 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-center text-sm text-yellow-200">
                {message}
              </div>
            )}
            <button
              onClick={async () => {
                if (authMode === "register") {
                  if (!fullName.trim()) {
                    setMessage("Vui lòng nhập họ và tên.");
                    return;
                  }

                  if (!email.trim()) {
                    setMessage("Vui lòng nhập email.");
                    return;
                  }

                  const { data: existingUser, error: checkError } = await supabase
                    .from("users")
                    .select("id,email")
                    .eq("email", email.trim().toLowerCase())
                    .maybeSingle();

                  if (checkError) {
                    console.log("SUPABASE CHECK ERROR:", checkError);
                    setMessage("Lỗi kiểm tra email Supabase: " + checkError.message);
                    return;
                  }

                  if (existingUser) {
                    setMessage("Email này đã được đăng ký.");
                    return;
                  }

                  if (!sentCode) {
                    setMessage("Vui lòng gửi mã xác thực trước.");
                    return;
                  }

                  if (!code.trim()) {
                    setMessage("Vui lòng nhập mã xác thực.");
                    return;
                  }

                  if (code.trim() !== String(sentCode).trim()) {
                    setMessage("Mã xác thực không đúng.");
                    return;
                  }

                  if (!password) {
                    setMessage("Vui lòng nhập mật khẩu.");
                    return;
                  }

                  if (password.length < 6) {
                    setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
                    return;
                  }

                  if (!confirmPassword) {
                    setMessage("Vui lòng xác nhận mật khẩu.");
                    return;
                  }

                  if (password !== confirmPassword) {
                    setMessage("Mật khẩu xác nhận không trùng khớp.");
                    return;
                  }

                  const { error: insertError } = await supabase.from("users").insert([
                    {
                      full_name: fullName.trim(),
                      email: email.trim().toLowerCase(),
                      password: password,
                      email_verified: true,
                    },
                  ]);

                  if (insertError) {
                    setMessage("Không lưu được tài khoản: " + insertError.message);
                    return;
                  }

                  setIsVerified(true);
                  setMessage("Đăng ký thành công.");
                  alert("Đăng ký thành công.");
                  setAuthMode("login");
                  return;
                }

                if (authMode === "forgot") {
                  if (!email.trim()) {
                    setMessage("Vui lòng nhập email đã đăng ký.");
                    return;
                  }

                  const { data: existingUser, error: findError } = await supabase
                    .from("users")
                    .select("id,email")
                    .eq("email", email.trim().toLowerCase())
                    .maybeSingle();

                  if (findError) {
                    setMessage("Lỗi kiểm tra email.");
                    return;
                  }

                  if (!existingUser) {
                    setMessage("Email này chưa được đăng ký.");
                    return;
                  }

                  if (forgotStep === "verify") {
                    if (!sentCode) {
                      setMessage("Vui lòng bấm Gửi Mã trước.");
                      return;
                    }

                    if (!code.trim()) {
                      setMessage("Vui lòng nhập mã xác thực.");
                      return;
                    }

                    if (code.trim() !== String(sentCode).trim()) {
                      setMessage("Mã xác thực không đúng.");
                      return;
                    }

                    setForgotStep("reset");
                    setPassword("");
                    setConfirmPassword("");
                    setMessage("Xác thực thành công. Vui lòng tạo mật khẩu mới.");
                    return;
                  }

                  if (!password) {
                    setMessage("Vui lòng nhập mật khẩu mới.");
                    return;
                  }

                  if (password.length < 6) {
                    setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
                    return;
                  }

                  if (!confirmPassword) {
                    setMessage("Vui lòng xác nhận mật khẩu mới.");
                    return;
                  }

                  if (password !== confirmPassword) {
                    setMessage("Mật khẩu xác nhận không trùng khớp.");
                    return;
                  }

                  const { error: updateError } = await supabase
                    .from("users")
                    .update({
                      password: password,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("email", email.trim().toLowerCase());

                  if (updateError) {
                    setMessage("Không đổi được mật khẩu: " + updateError.message);
                    return;
                  }

                  setMessage("Đổi mật khẩu thành công.");
                  alert("Đổi mật khẩu thành công.");
                  setAuthMode("login");
                  setForgotStep("verify");
                  setCode("");
                  setSentCode("");
                  setPassword("");
                  setConfirmPassword("");
                  return;
                }

                if (authMode === "login") {
                  if (!email.trim()) {
                    setMessage("Vui lòng nhập email.");
                    return;
                  }

                  if (!password) {
                    setMessage("Vui lòng nhập mật khẩu.");
                    return;
                  }

                  const { data: user, error: loginError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", email.trim().toLowerCase())
                    .eq("password", password)
                    .maybeSingle();

                  if (loginError) {
                    setMessage("Lỗi đăng nhập.");
                    return;
                  }

                  if (!user) {
                    setMessage("Email hoặc mật khẩu không đúng.");
                    return;
                  }

                  setMessage("");
                  setCurrentUserName(user.full_name || user.email);
                  setAccountType("Free");
                  setIsLoggedIn(true);
                  setAuthMode(null);

                  await supabase.from("login_logs").insert([
                    {
                      email: user.email,

                      user_id: user.id,

                      login_status: "success",

                      device: navigator.userAgent,

                      created_at: new Date(),
                    },
                  ]);

                  localStorage.setItem(
                  "xcap_user",
                  JSON.stringify({
                    email: user.email,
                    full_name: user.full_name,
                    accountType: "Free",
                  })
                );
                }
              }}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-600 text-black py-4 text-lg font-semibold shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              {authMode === "register"
                ? "Đăng Ký"
                : authMode === "forgot"
                ? forgotStep === "verify"
                  ? "Lấy Lại Mật Khẩu"
                  : "Cập Nhật Mật Khẩu"
                : "Đăng Nhập"}
            </button>

            {authMode === "login" && (
              <p className="mt-3 mb-5 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setForgotStep("verify");
                    setMessage("");
                    setCode("");
                    setSentCode("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-yellow-300 hover:text-yellow-100 transition"
                >
                  Quên mật khẩu?
                </button>
              </p>
            )}

            <p className="text-center text-gray-400 mt-5">
              {authMode === "register" && (
                <>
                  Đã có tài khoản?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-yellow-300"
                  >
                    Đăng nhập
                  </button>
                </>
              )}

              {authMode === "login" && (
                <>
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
                    className="text-yellow-300"
                  >
                    Đăng ký
                  </button>
                </>
              )}

              {authMode === "forgot" && (
                <>
                  Đã nhớ mật khẩu?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setForgotStep("verify");
                      setMessage("");
                    }}
                    className="text-yellow-300"
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function GoldBackground() {
  return (
    <>
      {/* Nền đen vàng luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_72%,rgba(255,200,55,0.55),transparent_15%),radial-gradient(circle_at_92%_38%,rgba(255,210,90,0.28),transparent_18%),radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.14),transparent_30%),linear-gradient(135deg,#010101_0%,#0b0802_45%,#020202_100%)]" />

      {/* Lưới trading mờ */}
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(212,175,55,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.22)_1px,transparent_1px)] bg-[length:72px_72px]" />

      {/* Hạt vàng */}
      <div className="absolute inset-0 opacity-[0.32] bg-[radial-gradient(circle,rgba(255,220,120,0.95)_1px,transparent_2px)] bg-[length:42px_42px]" />

      {/* Đường giá vàng */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        <path
          d="M0 620 C160 555 265 690 430 615 C585 545 680 430 820 500 C950 565 1030 330 1170 385 C1305 438 1400 280 1600 315"
          fill="none"
          stroke="rgba(255,218,110,0.62)"
          strokeWidth="3"
        />
        <path
          d="M0 660 C185 610 325 720 490 645 C650 575 735 485 870 540 C1015 598 1105 395 1245 450 C1380 505 1480 360 1600 388"
          fill="none"
          stroke="rgba(212,175,55,0.28)"
          strokeWidth="2"
        />
      </svg>

      {/* Candle vàng mờ */}
      <div className="absolute bottom-[115px] left-[220px] flex items-end gap-3 opacity-35">
        {[80, 125, 95, 155, 105, 180, 120, 205, 135, 165, 110, 190].map(
          (height, index) => (
            <div
              key={index}
              className="w-5 rounded-t-sm bg-gradient-to-t from-yellow-800/30 via-yellow-400/70 to-yellow-100/95 shadow-[0_0_18px_rgba(212,175,55,0.6)]"
              style={{ height }}
            />
          )
        )}
      </div>

      {/* Sóng vàng phía trên */}
      <div className="absolute top-[-25px] right-[-80px] w-[980px] h-[290px] opacity-65 rotate-[11deg] bg-[repeating-linear-gradient(105deg,rgba(255,223,120,0.82)_0_1px,transparent_1px_12px)] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_76%)] drop-shadow-[0_0_35px_rgba(212,175,55,0.7)]" />

      {/* Sóng vàng phía dưới */}
      <div className="absolute bottom-[-95px] left-[-120px] w-[1050px] h-[310px] opacity-72 rotate-[-7deg] bg-[repeating-linear-gradient(84deg,rgba(255,223,120,0.8)_0_1px,transparent_1px_12px)] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_76%)] drop-shadow-[0_0_35px_rgba(212,175,55,0.75)]" />

      {/* Vòng sáng trái */}
      <div className="absolute left-[-150px] bottom-[125px] w-[360px] h-[360px] rounded-full border border-yellow-200/25 shadow-[0_0_110px_rgba(255,205,70,0.72),inset_0_0_60px_rgba(255,205,70,0.16)]" />

      {/* Vòng sáng phải */}
      <div className="absolute right-[-80px] top-[260px] w-[285px] h-[285px] rounded-full border border-yellow-200/25 shadow-[0_0_90px_rgba(255,205,70,0.45),inset_0_0_55px_rgba(255,205,70,0.16)]" />

      {/* Ánh sáng góc dưới trái */}
      <div className="absolute left-[-80px] bottom-[165px] w-[210px] h-[210px] rounded-full bg-yellow-300/35 blur-3xl" />

      {/* Ánh sáng góc phải */}
      <div className="absolute right-[-60px] top-[330px] w-[190px] h-[190px] rounded-full bg-yellow-300/20 blur-3xl" />

      {/* Làm tối cạnh trên/dưới cho chữ nổi hơn */}
      <div className="absolute top-0 left-0 w-full h-[160px] bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[180px] bg-gradient-to-t from-black/75 to-transparent" />
    </>
  );
}