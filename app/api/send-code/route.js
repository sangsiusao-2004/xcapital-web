import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Vui lòng nhập email",
        },
        { status: 400 }
      );
    }

    // Tạo mã 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Kết nối Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Gửi mail
    await transporter.sendMail({
      from: `"X-Capital Verify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực đăng ký X-Capital",
      html: `
        <div style="font-family:Arial;padding:30px;background:#0a0a0a;color:white;">
          <h2 style="color:#d4af37;">X-Capital Verification</h2>
          <p>Mã xác thực của bạn là:</p>
          <div style="
            font-size:38px;
            font-weight:bold;
            color:#d4af37;
            padding:15px 25px;
            background:#111;
            display:inline-block;
            border-radius:12px;
            letter-spacing:4px;
          ">
            ${code}
          </div>
          <p style="margin-top:20px;">Không chia sẻ mã này cho người khác.</p>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message: "Đã gửi mã xác thực",
      code,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}