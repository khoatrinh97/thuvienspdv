import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    features TEXT,
    conditions TEXT,
    details TEXT,
    lastUpdated TEXT,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS qa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    FOREIGN KEY (itemId) REFERENCES items(id)
  );
`);

// Seed initial data
function seed() {
  const insertCategory = db.prepare("INSERT INTO categories (name, icon) VALUES (?, ?)");
  const insertItem = db.prepare("INSERT INTO items (categoryId, name, description, features, conditions, details, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertQA = db.prepare("INSERT INTO qa (itemId, question, answer) VALUES (?, ?, ?)");

  const categories = [
    { name: "HUY ĐỘNG VỐN", icon: "Wallet" },
    { name: "TÍN DỤNG", icon: "TrendingUp" },
    { name: "THẺ ĐỊNH DANH", icon: "IdCard" },
    { name: "THẺ TÍN DỤNG", icon: "CreditCard" },
    { name: "BẢO HIỂM", icon: "ShieldCheck" },
    { name: "SẢN PHẨM KHÁC", icon: "LayoutGrid" }
  ];

  for (const cat of categories) {
    const exists = db.prepare("SELECT id FROM categories WHERE name = ?").get(cat.name);
    if (!exists) {
      insertCategory.run(cat.name, cat.icon);
    }
  }

  const getCatId = (name: string) => (db.prepare("SELECT id FROM categories WHERE name = ?").get(name) as { id: number }).id;

  const items = [
    {
      cat: "HUY ĐỘNG VỐN",
      name: "Biểu lãi suất niêm yết",
      desc: "Bảng tổng hợp lãi suất huy động tiền gửi tiết kiệm và tiền gửi có kỳ hạn mới nhất đang được áp dụng tại hệ thống (Dữ liệu tham khảo BIDV Nam Bình Dương).",
      features: [
        "Cập nhật thời gian thực theo biến động thị trường",
        "Chi tiết lãi suất cho từng kỳ hạn từ 1 tháng đến trên 18 tháng",
        "Áp dụng cho các phân khúc khách hàng khác nhau (Tiêu chuẩn, Ưu tiên)"
      ],
      cond: "Áp dụng cho khách hàng cá nhân gửi tiền tại khu vực Nam Bình Dương.",
      details: `### BIỂU LÃI SUẤT HUY ĐỘNG TIỀN GỬI NIÊM YẾT

#### 1. LÃI SUẤT TẠI QUẦY (TRẢ LÃI CUỐI KỲ)

| Kỳ hạn | USD | VND |
| :--- | :---: | :---: |
| Không kỳ hạn | 0% | 0,1% |
| 1 Tháng | 0% | 2,1% |
| 2 Tháng | 0% | 2,1% |
| 3 Tháng | 0% | 2,4% |
| 5 Tháng | 0% | 2,4% |
| 6 Tháng | 0% | 3,5% |
| 9 Tháng | 0% | 3,5% |
| 12 Tháng | 0% | 5,2% |
| 13 Tháng | 0% | 5,2% |
| 15 Tháng | 0% | 5,2% |
| 18 Tháng | 0% | 5,2% |
| 24 Tháng | 0% | 5,3% |
| 36 Tháng | 0% | 5,3% |

#### 2. LÃI SUẤT TIỀN GỬI ONLINE

| Kỳ hạn | VND |
| :--- | :---: |
| 1 Tuần | 0,3% |
| 2 Tuần | 0,3% |
| 3 Tuần | 0,3% |
| 1 Tháng | 3,0% |
| 2 Tháng | 3,0% |
| 3 Tháng | 3,4% |
| 4 Tháng | 3,4% |
| 5 Tháng | 3,4% |
| 6 Tháng | 4,5% |
| 7 Tháng | 4,5% |
| 8 Tháng | 4,5% |
| 9 Tháng | 4,5% |
| 10 Tháng | 4,5% |
| 11 Tháng | 4,5% |
| 12 Tháng | 5,2% |
| 13 Tháng | 5,3% |
| 15 Tháng | 5,3% |
| 18 Tháng | 5,3% |
| 24 Tháng | 5,3% |
| 36 Tháng | 5,3% |

#### 3. TIỀN GỬI TÍCH LŨY

| Kỳ hạn | VND |
| :--- | :---: |
| 3 Tháng | 3,1% |
| 6 Tháng | 3,8% |
| 7 Tháng | 3,8% |
| 8 Tháng | 3,8% |
| 9 Tháng | 3,8% |
| 10 Tháng | 3,8% |
| 11 Tháng | 3,8% |
| 12 Tháng | 4,5% |
| 24 Tháng | 4,6% |
| 36 Tháng | 4,6% |
| 48 Tháng | 4,6% |
| 60 Tháng | 4,6% |

*Lưu ý: Lãi suất trên áp dụng cho tiền gửi trả lãi cuối kỳ. Lãi suất tiền gửi online thường được ưu đãi hơn so với lãi suất niêm yết tại quầy. Mức ưu đãi cụ thể được hiển thị trực tiếp trên ứng dụng SmartBanking tại thời điểm giao dịch.*`,
      updated: "16/03/2026"
    },
    {
      cat: "HUY ĐỘNG VỐN",
      name: "Lãi suất tại quầy",
      desc: "Thông tin lãi suất áp dụng trực tiếp tại các quầy giao dịch (Theo CV 7687/BIDV- ALCO).",
      features: [
        "Áp dụng cho các món tiền gửi thông thường và trên 100 triệu đồng",
        "Cơ chế FTP bổ sung cho các giao dịch được phê duyệt vượt trần",
        "Ưu đãi ngày vàng cho kỳ hạn trên 13 tháng"
      ],
      cond: "Áp dụng tại hệ thống BIDV theo thẩm quyền GĐCN.",
      details: `### CẬP NHẬT CHÍNH SÁCH SẢN PHẨM LÃI SUẤT (CV 7687/BIDV- ALCO)
**Ngày hiệu lực:** 12/03/2026

#### 1. KHUNG LÃI SUẤT HUY ĐỘNG THẨM QUYỀN GĐCN

| Kỳ hạn | 1T < 6T | 6 < 9T | 9 < 12T | 12 < 13T | 13 < 18T | > 18T |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mức 1** (Thông thường) | 4.75 | 7.10 | 7.10 | 7.20 | 7.30 | 7.30 |
| **Mức 2** (≥ 100 triệu đồng) | 4.75 | 7.30 | 7.30 | 7.40 | 7.50 | 7.50 |

#### 2. CƠ CHẾ FTP BỔ SUNG HĐV
- **Đối tượng:** Giao dịch tiền gửi có LSHĐV > Trần LSHĐV cơ sở.
- **Trần LSHĐV cơ sở:** 6,4%/năm (6-<12T) và 6,6%/năm (>=12T).
- **Công thức:** FTP bổ sung = Tỷ lệ cấp bù x (LSHĐV phê duyệt - Trần LSHĐV cơ sở).
- **Tỷ lệ cấp bù:** 80% (6-<12T) và 70% (>=12T).

#### 3. SẢN PHẨM HĐV "NGÀY VÀNG"
- Áp dụng FTP bổ sung **+0,2%/năm** cho các khoản tiền gửi VNĐ kỳ hạn ≥ 13 tháng phát sinh vào ngày cuối cùng của tháng.

#### 4. CHÍNH SÁCH CHO VAY BẤT ĐỘNG SẢN

| MỤC ĐÍCH VAY | NỘI DUNG |
| :--- | :--- |
| **BĐS Khu công nghiệp** | Sàn LSCV: Cao hơn 0,3%/năm so sàn cơ sở. FTP bán vốn: Theo cơ sở thông thường. |
| **Thi công xây lắp KHDN** | Không tính vào lĩnh vực BĐS, phân loại vào nhóm ngành hạn chế. |
| **Các ngành BĐS khác** | Giữ nguyên theo cơ chế hiện hành. |

#### 5. FTP MUA VỐN, BÁN VỐN USD
- **Tỷ lệ cấp bù:** 90% (kỳ hạn < 12 tháng) và 80% (kỳ hạn >= 12 tháng).`,
      updated: "12/03/2026"
    },
    {
      cat: "TÍN DỤNG",
      name: "Ưu đãi vay SXKD 2026",
      desc: "Chương trình ưu đãi lãi suất cho vay SXKD dành cho khách hàng cá nhân, hộ kinh doanh và tiểu thương năm 2026.",
      features: [
        "Lãi suất ưu đãi chỉ từ 7.0%/năm cho vay ngắn hạn",
        "Lãi suất ưu đãi chỉ từ 8.2%/năm cho vay trung dài hạn",
        "Giảm thêm 0.2%/năm cho khách hàng mới hoặc khách hàng cao cấp",
        "Áp dụng cho vay bổ sung vốn lưu động hoặc trả nợ trước hạn tại TCTD khác",
        "Đăng ký và giải ngân thuận tiện qua ứng dụng BIDV Home"
      ],
      cond: "Áp dụng cho các khoản vay giải ngân lần đầu từ 30/01/2026 đến hết 30/06/2026.",
      details: `### CHƯƠNG TRÌNH ƯU ĐÃI LÃI SUẤT CHO VAY SXKD 2026

#### 1. VAY VỐN NGẮN HẠN PHỤC VỤ SXKD
*Áp dụng cho các khoản vay giải ngân lần đầu từ 09/02/2026 đến hết 30/06/2026.*

| Thời gian vay | Lãi suất ưu đãi |
| :--- | :--- |
| < 03 tháng | **7.0%/năm** |
| Từ 3 tháng đến < 06 tháng | **7.3%/năm** |
| Từ 6 tháng đến < 09 tháng | **7.8%/năm** |
| Từ 9 tháng đến 12 tháng | **8.0%/năm** |

#### 2. VAY VỐN TRUNG DÀI HẠN PHỤC VỤ SXKD
*Áp dụng cho các khoản vay giải ngân lần đầu từ 30/01/2026 đến hết 30/06/2026.*

| Chương trình | Thời gian cố định lãi suất | Lãi suất tối thiểu |
| :--- | :--- | :--- |
| 1 | 06 tháng đầu tiên | **8.2%/năm** |
| 2 | 12 tháng đầu tiên | **8.7%/năm** |
| 3 | 18 tháng đầu tiên | **9.0%/năm** |

#### 3. CHÍNH SÁCH ƯU ĐÃI THÊM
**Giảm thêm 0.2%/năm** đối với khách hàng thỏa mãn 1 trong các tiêu chí:
1. **Khách hàng mới:** Không có khoản vay/thẻ tín dụng tại BIDV tại 31/12/2025.
2. **Khách hàng cao cấp:** Phân hạng Premier, Elite, Private.
3. **Thu nhập qua BIDV:** 100% nguồn thu nhập trả nợ nhận trực tiếp qua tài khoản BIDV.
4. **BIDV Home:** Đăng ký vay và giải ngân thành công qua ứng dụng BIDV Home.

#### 4. MỤC ĐÍCH VAY
- Bổ sung vốn lưu động phục vụ SXKD.
- Vay phục vụ SXKD (bao gồm kinh doanh dịch vụ lưu trú và nhà hàng).
- Vay để trả nợ trước hạn tại TCTD khác đối với các mục đích trên.`,
      updated: "16/03/2026"
    },
    {
      cat: "TÍN DỤNG",
      name: "Gói vay SXKD ngắn hạn (CV 3478)",
      desc: "Gói tín dụng ngắn hạn cạnh tranh dành cho khách hàng cá nhân vay vốn sản xuất kinh doanh (Theo CV 3478/BIDV-SPBL).",
      features: [
        "Lãi suất cạnh tranh chỉ từ 7.0%/năm",
        "Quy mô gói lên đến 200.000 tỷ đồng",
        "Ưu đãi giảm thêm 0.2%/năm cho đối tượng ưu tiên",
        "Áp dụng cho vay bổ sung vốn lưu động phục vụ SXKD",
        "Thời gian triển khai đến hết 30/06/2026"
      ],
      cond: "KH xếp hạng tín dụng từ A trở lên, không có nợ xấu, duy trì số dư tài khoản thanh toán tối thiểu 10 triệu đồng.",
      details: `### GÓI TÍN DỤNG NGẠN HẠN CẠNH TRANH CHO VAY SXKD (CV 3478)

#### 1. LÃI SUẤT CHO VAY ƯU ĐÃI
*Mức lãi suất cho vay tối thiểu (cố định/thả nổi):*

| Kỳ hạn | Lãi suất tối thiểu |
| :--- | :--- |
| < 03 tháng | **7.0%/năm** |
| Từ 03 tháng - < 06 tháng | **7.3%/năm** |
| Từ 06 tháng - < 09 tháng | **7.8%/năm** |
| Từ 09 tháng - 12 tháng | **8.0%/năm** |

#### 2. CHÍNH SÁCH ƯU ĐÃI THÊM
**Giảm thêm tối đa 0.2%/năm** lãi suất cho vay đối với các đối tượng:
- Khách hàng tiểu thương nhận 100% thu nhập qua tài khoản BIDV.
- Khách hàng mới (không có dư nợ/thẻ tại BIDV đến 31/12/2025).
- Khách hàng cao cấp (Premier, Elite, Private).
- Đăng ký vay và giải ngân thành công qua ứng dụng **BIDV Home**.

#### 3. ĐIỀU KIỆN DUY TRÌ ƯU ĐÃI
- Khách hàng có nghĩa vụ duy trì số dư tiền gửi trên tài khoản thanh toán tại BIDV với số dư bình quân hàng tháng **tối thiểu 10 triệu đồng**.
- Trường hợp không duy trì đủ số dư, BIDV sẽ dừng áp dụng lãi suất ưu đãi và điều chỉnh về mức lãi suất cơ sở cộng tối thiểu 4%.

#### 4. THÔNG TIN CHUNG
- **Quy mô:** 200.000 tỷ đồng.
- **Thời hạn áp dụng:** Đến hết ngày **30/06/2026** hoặc khi hết quy mô gói.
- **Đối tượng:** KHCN vay vốn ngắn hạn bổ sung vốn lưu động phục vụ SXKD (bao gồm cả vay trả nợ trước hạn tại TCTD khác).`,
      updated: "16/03/2026"
    },
    {
      cat: "TÍN DỤNG",
      name: "Gói tín dụng xanh (CV 02)",
      desc: "Gói tín dụng ưu đãi dành cho khách hàng cá nhân vay vốn phục vụ mục đích xanh và phát triển bền vững (Theo CV 02/BIDV-SPBL).",
      features: [
        "Lãi suất ưu đãi cạnh tranh",
        "Ân hạn trả nợ gốc lên đến 24 tháng",
        "Quy mô gói 10.000 tỷ đồng",
        "Áp dụng cho xe điện, điện mặt trời, công trình xanh",
        "Hỗ trợ SXKD đáp ứng tiêu chuẩn VietGAP, GlobalGAP, OCOP..."
      ],
      cond: "KH xếp hạng tín dụng từ A trở lên, không có nợ xấu, duy trì số dư tài khoản thanh toán tối thiểu 10 triệu đồng.",
      details: `### GÓI TÍN DỤNG XANH DÀNH CHO KHCN (CV 02)

#### 1. MỤC ĐÍCH VAY VỐN ƯU ĐÃI
- **Năng lượng tái tạo:** Mua, lắp đặt điện mặt trời áp mái, điện gió (đời sống hoặc kinh doanh).
- **Phương tiện xanh:** Mua xe ô tô điện phục vụ đời sống hoặc sản xuất kinh doanh.
- **Công trình xanh:** Vay mua nhà tại các dự án đáp ứng chứng nhận LEED, LOTUS, EDGE, GREEN MARK.
- **Sản xuất bền vững:** Phương án SXKD đáp ứng các chứng chỉ: VietGAP, GlobalGAP, ISO 22000, HACCP, OCOP, hữu cơ (TCVN 11041), quản lý môi trường (ISO 14001)...

#### 2. CHÍNH SÁCH ƯU ĐÃI ĐẶC BIỆT
- **Lãi suất:** Áp dụng mức lãi suất ưu đãi cạnh tranh theo từng thời kỳ.
- **Ân hạn gốc:** Đối với vay trung dài hạn, thời gian ân hạn trả nợ gốc tối đa lên đến **24 tháng**.
- **Hạn mức:** Duy trì hạn mức tín dụng tối đa 24 tháng đối với vay ngắn hạn phục vụ SXKD.

#### 3. ĐIỀU KIỆN DUY TRÌ ƯU ĐÃI
- Khách hàng duy trì số dư tiền gửi không kỳ hạn bình quân hàng tháng tối thiểu **10 triệu đồng**.
- Trường hợp không duy trì đủ số dư, lãi suất sẽ được điều chỉnh về mức lãi suất cơ sở cộng tối thiểu 4%.

#### 4. THÔNG TIN CHUNG
- **Quy mô:** 10.000 tỷ đồng.
- **Thời hạn áp dụng:** Đến hết ngày **30/06/2026** hoặc khi hết quy mô gói.
- **Phạm vi:** Triển khai trên toàn hệ thống BIDV.`,
      updated: "16/03/2026"
    },
    {
      cat: "TÍN DỤNG",
      name: "Gói vay trung dài hạn (CV 3466)",
      desc: "Gói tín dụng cạnh tranh trung dài hạn dành cho khách hàng cá nhân vay mua nhà, ô tô, tiêu dùng và SXKD (Theo CV 3466/BIDV-SPBL).",
      features: [
        "Lãi suất ưu đãi chỉ từ 8.2%/năm",
        "Quy mô gói lên đến 100.000 tỷ đồng",
        "Thời gian vay linh hoạt, tối thiểu từ 36 tháng",
        "Ưu đãi giảm thêm 0.2%/năm cho đối tượng ưu tiên",
        "Áp dụng cho vay mua nhà, ô tô, tiêu dùng có TSBĐ và SXKD"
      ],
      cond: "KH xếp hạng tín dụng từ A trở lên, không có nợ xấu, duy trì số dư tài khoản thanh toán tối thiểu 10 triệu đồng.",
      details: `### GÓI TÍN DỤNG CẠNH TRANH TRUNG DÀI HẠN CHO VAY KHCN (CV 3466)

#### 1. LÃI SUẤT CHO VAY ƯU ĐÃI TỐI THIỂU
*Áp dụng cho các sản phẩm chuẩn (không gồm lĩnh vực BĐS):*

| Chương trình | Thời gian cố định lãi suất | Lãi suất tối thiểu |
| :--- | :--- | :--- |
| 1 | 06 tháng đầu tiên | **8.2%/năm** |
| 2 | 12 tháng đầu tiên | **8.7%/năm** |
| 3 | 18 tháng đầu tiên | **9.0%/năm** |

*Đối với sản phẩm Cho vay nhu cầu Nhà ở:*
- Cố định 06 tháng: Tối thiểu **9.7%/năm**.
- Cố định 12 tháng: Tối thiểu **10.1%/năm**.
- Cố định 18 tháng: **13.5%/năm**.

#### 2. CHÍNH SÁCH ƯU ĐÃI THÊM
**Giảm thêm tối đa 0.2%/năm** lãi suất cho vay đối với các đối tượng:
- Khách hàng mới (không có dư nợ/thẻ tại BIDV đến 31/12/2025).
- Khách hàng cao cấp (Premier, Elite, Private).
- Thu nhập nhận 100% qua tài khoản BIDV.
- Đăng ký vay và giải ngân thành công qua ứng dụng **BIDV Home**.

#### 3. ĐIỀU KIỆN DUY TRÌ ƯU ĐÃI
- Khách hàng có nghĩa vụ duy trì số dư tiền gửi trên tài khoản thanh toán tại BIDV với số dư bình quân hàng tháng **tối thiểu 10 triệu đồng**.
- Trường hợp không duy trì đủ số dư, BIDV sẽ dừng áp dụng lãi suất ưu đãi và điều chỉnh về mức lãi suất cơ sở cộng tối thiểu 4%.

#### 4. THÔNG TIN CHUNG
- **Quy mô:** 100.000 tỷ đồng.
- **Thời hạn áp dụng:** Đến hết ngày **30/06/2026** hoặc khi hết quy mô gói.
- **Đối tượng:** KHCN vay vốn trung dài hạn phục vụ nhu cầu nhà ở, mua ô tô, đời sống có TSBĐ, SXKD (bao gồm cả vay trả nợ trước hạn tại TCTD khác).`,
      updated: "16/03/2026"
    },
    {
      cat: "TÍN DỤNG",
      name: "Lãi suất cho vay - CN Nam Bình Dương",
      desc: "Thông báo mức lãi suất cho vay áp dụng đối với khách hàng bán lẻ tại Chi nhánh Nam Bình Dương (Cập nhật 13/03/2026).",
      features: [
        "Lãi suất vay SXKD chỉ từ 9.0%/năm",
        "Lãi suất vay tiêu dùng có TSBĐ chỉ từ 9.9%/năm",
        "Lãi suất cơ sở vay ngắn hạn: 4.5%/năm",
        "Lãi suất cơ sở vay trung dài hạn: 5.3%/năm",
        "Áp dụng cho vay đời sống, SXKD, Bất động sản"
      ],
      cond: "Áp dụng cho khách hàng cá nhân tại BIDV Nam Bình Dương. Lãi suất thay đổi theo kỳ hạn và mục đích vay.",
      details: `### THÔNG BÁO LÃI SUẤT CHO VAY - CN NAM BÌNH DƯƠNG
*Áp dụng từ ngày 13/03/2026 đối với khách hàng bán lẻ.*

#### 1. LÃI SUẤT CHO VAY NGẮN HẠN
**Công thức:** Lãi suất = Lãi suất cơ sở (4.5%) + Biên độ (Margin 4% + Spread)

| Sản phẩm cho vay | Spread | Lãi suất (%/năm) |
| :--- | :--- | :--- |
| Tiêu dùng không TSBĐ (theo món) | +5.5 | **14.0%** |
| Tiêu dùng không TSBĐ (thấu chi) | +5.0 | **13.5%** |
| Tiêu dùng có TSBĐ (theo món) | +1.4 | **9.9%** |
| Sản xuất kinh doanh - Lĩnh vực BĐS | +1.3 đến +1.4 | **9.8% - 9.9%** |
| Sản xuất kinh doanh - Lĩnh vực khác | +0.5 đến +1.0 | **9.0% - 9.5%** |

#### 2. LÃI SUẤT CHO VAY TRUNG DÀI HẠN
**Công thức:** Lãi suất = Lãi suất cơ sở (5.3%) + Biên độ (Margin 4% + Spread)

| Sản phẩm cho vay | Spread | Lãi suất (%/năm) |
| :--- | :--- | :--- |
| Tiêu dùng không TSBĐ - Lĩnh vực BĐS | +6.2 | **15.5%** |
| Tiêu dùng không TSBĐ - Lĩnh vực khác | +5.2 | **14.5%** |
| Tiêu dùng có TSBĐ - Lĩnh vực BĐS | +2.6 | **11.9%** |
| Tiêu dùng có TSBĐ - Lĩnh vực khác | +2.0 | **11.3%** |
| SXKD - Lĩnh vực BĐS | +1.7 | **11.0%** |
| SXKD - Lĩnh vực khác | +0.7 | **10.0%** |

#### 3. SÀN LÃI SUẤT CHO VAY (VNĐ)
| Kỳ hạn | Sàn LSCV chuẩn | Sàn BĐS KCN | Sàn BĐS khác |
| :--- | :--- | :--- | :--- |
| Dưới 1 tháng | 5.20% | 5.50% | 7.00% |
| 1 - <3 tháng | 6.50% | 6.80% | 8.30% |
| 3 - <6 tháng | 7.00% | 7.30% | 8.80% |
| 6 - <12 tháng | 7.80% | 8.10% | 9.60% |
| 12 tháng | 8.00% | 8.30% | 9.80% |
| Trên 12 tháng | 8.20% - 9.20% | 8.50% - 9.50% | 10.0% - 11.0% |`,
      updated: "16/03/2026"
    },
    {
      cat: "THẺ TÍN DỤNG",
      name: "BIDV Visa Online",
      desc: "Thẻ tín dụng chuyên biệt cho các tín đồ mua sắm trực tuyến với ưu đãi hoàn tiền và tích điểm vượt trội.",
      features: [
        "Tích điểm 6% giá trị giao dịch tại Tiki, Shopee, Lazada, TiktokShop",
        "Tích điểm 3% giá trị các giao dịch chi tiêu trực tuyến khác",
        "Tích điểm tối đa 800.000 điểm/tháng/thẻ",
        "Bảo hiểm du lịch toàn cầu trị giá tới 11,65 tỷ đồng",
        "Miễn lãi tối đa lên đến 45 ngày",
        "Trả góp lãi suất 0% tại hàng ngàn đối tác liên kết",
        "Công nghệ thẻ chip EMV contact và contactless bảo mật tối ưu"
      ],
      cond: "Cá nhân từ 15 tuổi trở lên. Người nước ngoài cư trú tại Việt Nam từ 12 tháng trở lên.",
      details: `### CHI TIẾT SẢN PHẨM THẺ TÍN DỤNG BIDV VISA ONLINE

#### 1. CHƯƯNG TRÌNH TÍCH LŨY ĐIỂM THƯỞNG
- **Mức tích lũy:**
    - **6%:** Giao dịch chi tiêu online tại Tiki, Shopee, Lazada, TiktokShop.
    - **3%:** Giao dịch chi tiêu online khác.
- **Hạn mức tích điểm:** Tối đa **800.000 điểm/tháng/thẻ**.
- **Sử dụng điểm:** Linh hoạt đổi quà và hoàn tiền trực tiếp trên ứng dụng BIDV SmartBanking.

#### 2. ĐẶC QUYỀN & TIỆN ÍCH
- **Bảo hiểm:** Bảo hiểm du lịch toàn cầu với giá trị bảo vệ lên tới **11,65 tỷ đồng**.
- **Miễn lãi:** Thời gian miễn lãi tối đa lên đến **45 ngày**.
- **Trả góp:** Hỗ trợ trả góp 0% lãi suất tại hàng ngàn đối tác hoặc trả góp linh hoạt qua SMS/Website.
- **Quản lý:** Chủ động quản lý thẻ, khóa thẻ, đổi PIN và thanh toán dư nợ qua SmartBanking.

#### 3. BIỂU PHÍ & HẠN MỨC
- **Phí thường niên:**
    - Thẻ chính: 1.000.000 VND (Miễn phí năm tiếp theo nếu đạt doanh số chi tiêu từ 10-50 triệu đồng/năm).
    - Thẻ phụ: 600.000 VND.
- **Phí giao dịch:**
    - Phí chuyển đổi ngoại tệ: 1,1% số tiền giao dịch.
    - Phí xử lý giao dịch tại nước ngoài: 1,5% số tiền giao dịch.
- **Hạn mức:**
    - Thanh toán: Tối đa 100% hạn mức tín dụng.
    - Rút tiền mặt: 50% hạn mức tín dụng.

#### 4. HỒ SƠ ĐĂNG KÝ
- **Hồ sơ pháp lý:** Giấy tờ tùy thân (CCCD/Hộ chiếu), sổ hộ khẩu/tạm trú.
- **Hồ sơ tài chính:** Sao kê lương, hợp đồng lao động hoặc các giấy tờ chứng minh thu nhập/tài sản đảm bảo khác.
- **Cách thức mở thẻ:** Đăng ký tại chi nhánh BIDV toàn quốc hoặc yêu cầu phát hành ngay trên ứng dụng BIDV SmartBanking.`,
      updated: "16/03/2026"
    },
    {
      cat: "BẢO HIỂM",
      name: "BIC",
      desc: "Các sản phẩm bảo hiểm từ Tổng Công ty Cổ phần Bảo hiểm Ngân hàng Đầu tư và Phát triển Việt Nam (BIC).",
      features: [],
      cond: "Theo quy định của từng sản phẩm bảo hiểm cụ thể.",
      updated: "16/01/2026"
    },
    {
      cat: "BẢO HIỂM",
      name: "BIC Tâm An",
      desc: "Sản phẩm bảo hiểm chăm sóc sức khỏe cá nhân toàn diện với 6 chương trình linh hoạt: Cơ bản, Đồng, Bạc, Vàng, Bạch Kim và Kim Cương. Phạm vi bảo hiểm tại Việt Nam.",
      features: [
        "Quyền lợi tử vong, thương tật vĩnh viễn do tai nạn lên đến 1 tỷ đồng",
        "Chi trả chi phí y tế nội trú do bệnh và tai nạn lên đến 200 triệu đồng/năm",
        "Hỗ trợ chi phí phẫu thuật, vận chuyển cấp cứu và chăm sóc tại nhà",
        "Quyền lợi bổ sung đa dạng: Ngoại trú, Nha khoa và Thai sản (từ hạng Bạch Kim)",
        "Thời gian chờ linh hoạt: 30 ngày cho bệnh thông thường, 365 ngày cho bệnh đặc biệt/bệnh có sẵn",
        "Bảo lãnh viện phí tại hơn 200 bệnh viện, phòng khám uy tín trên toàn quốc",
        "Thủ tục bồi thường nhanh chóng, minh bạch qua ứng dụng BIC Online",
        "Không yêu cầu khám sức khỏe trước khi tham gia (tùy theo độ tuổi và tình trạng sức khỏe)",
        "Hỗ trợ tư vấn y tế 24/7 qua hotline chuyên biệt"
      ],
      cond: "Áp dụng cho khách hàng cá nhân từ 1 đến 65 tuổi. Phí bảo hiểm thay đổi theo độ tuổi và chương trình lựa chọn.",
      details: `### BẢNG QUYỀN LỢI BẢO HIỂM CHĂM SÓC SỨC KHỎE CÁ NHÂN

| Chương trình | Cơ bản | Đồng | Bạc | Vàng | Bạch Kim | Kim Cương |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Phạm vi địa lý** | Việt Nam | Việt Nam | Việt Nam | Việt Nam | Việt Nam | Việt Nam |
| **I. QUYỀN LỢI CƠ BẢN** | | | | | | |
| 1. Tử vong, thương tật vĩnh viễn do tai nạn; mất tích | 300tr | 300tr | 500tr | 600tr | 700tr | 1 tỷ |
| 2. Chi phí y tế do tai nạn | 30tr | 30tr | 50tr | 80tr | 100tr | 150tr |
| 3. Trợ cấp điều trị nội trú do tai nạn | 3tr | 3tr | 6tr | 12tr | 18tr | 24tr |
| - Số tiền trợ cấp/ngày | 50k | 50k | 100k | 200k | 300k | 400k |
| 4. Điều trị nội trú do bệnh | 30tr | 45tr | 70tr | 110tr | 160tr | 200tr |
| - Chi phí 01 ngày nằm viện | 1.5tr | 2tr | 3.5tr | 5.5tr | 8tr | 10tr |
| - Chi phí phẫu thuật | 30tr | 45tr | 70tr | 110tr | 160tr | 200tr |
| 5. Điều trị ngoại trú do bệnh | 3tr | 5tr | 10tr | 10tr | 15tr | 20tr |
| 6. Quyền lợi bảo hiểm nha khoa | - | 2tr | 2tr | 5tr | 7tr | 7tr |
| **II. QUYỀN LỢI BỔ SUNG** | | | | | | |
| 7. Bảo hiểm thai sản | - | - | - | - | 20tr | 30tr |
| **III. THỜI GIAN CHỜ** | | | | | | |
| - Tai nạn | 0 ngày | 0 ngày | 0 ngày | 0 ngày | 0 ngày | 0 ngày |
| - Bệnh thông thường | 30 ngày | 30 ngày | 30 ngày | 30 ngày | 30 ngày | 30 ngày |
| - Bệnh đặc biệt/có sẵn | 365 ngày | 365 ngày | 365 ngày | 365 ngày | 365 ngày | 365 ngày |

### BIỂU PHÍ BẢO HIỂM CHUẨN (VNĐ/NĂM)

| Độ tuổi | Cơ bản | Đồng | Bạc | Vàng | Bạch Kim | Kim Cương |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 - 6 tuổi | 4.800.000 | 5.730.000 | 6.540.000 | 6.870.000 | 7.370.000 | 7.750.000 |
| 7 - 18 tuổi | 2.010.000 | 2.300.000 | 2.650.000 | 2.790.000 | 3.040.000 | 3.350.000 |
| 19 - 45 tuổi | 2.390.000 | 2.730.000 | 3.370.000 | 3.620.000 | 4.030.000 | 4.660.000 |
| 46 - 55 tuổi | 3.300.000 | 3.820.000 | 4.920.000 | 5.270.000 | 5.880.000 | 6.880.000 |
| 56 - 65 tuổi | 4.660.000 | 5.390.000 | 6.990.000 | 7.530.000 | 8.440.000 | 10.050.000 |`,
      updated: "16/01/2026"
    },
    {
      cat: "BẢO HIỂM",
      name: "BIC Smart Care",
      desc: "Bảo hiểm sức khỏe cao cấp dành riêng cho khách hàng BIDV với các quyền lợi ưu việt và toàn diện, mở rộng phạm vi bảo hiểm tới Đông Nam Á, Châu Á và Toàn Cầu.",
      features: [
        "3 chương trình bảo hiểm cao cấp: S-VIP, V-VIP và VIP",
        "Quyền lợi bảo hiểm tối đa lên đến 2 tỷ đồng",
        "Phạm vi địa lý mở rộng: Đông Nam Á, Châu Á và Toàn Cầu",
        "Không yêu cầu khám sức khỏe trước khi tham gia",
        "Bảo lãnh viện phí tại hơn 200 bệnh viện/phòng khám cao cấp trên toàn quốc",
        "Bồi thường online nhanh chóng, tiện lợi trong vòng 48 giờ",
        "Trợ cấp thu nhập chi ngày nằm viện 500.000 đồng/ngày"
      ],
      cond: "Công dân Việt Nam hoặc người nước ngoài cư trú hợp pháp tại Việt Nam từ 15 ngày tuổi đến 65 tuổi.",
      details: `### TÓM TẮT QUYỀN LỢI BIC SMART CARE
      
| Đặc điểm Chương trình | S-VIP | V-VIP | VIP |
| :--- | :---: | :---: | :---: |
| **Phạm vi địa lý** | Toàn cầu | Châu Á | Đông Nam Á |
| **Bảo hiểm tai nạn, mất tích** | 2 tỷ đồng | 1 tỷ đồng | 800 triệu đồng |
| **Bảo hiểm sức khỏe** | | | |
| - Nội trú | 400 triệu đồng | 200 triệu đồng | 200 triệu đồng |
| - Ngoại trú | 100 triệu đồng | 50 triệu đồng | 30 triệu đồng |
| - Thai sản | 400 triệu đồng | 200 triệu đồng | 200 triệu đồng |

#### QUYỀN LỢI CHI TIẾT
- **Nội trú:** Chi trả chi phí phẫu thuật, điều trị nội trú do ốm đau, bệnh tật; trợ cấp nằm viện.
- **Ngoại trú:** Chi trả chi phí khám và điều trị do ốm đau, bệnh tật; nha khoa, vật lý trị liệu; phụ khoa, nam khoa.
- **Thai sản:** Chi trả quyền lợi sinh thường, sinh mổ, biến chứng thai sản.
- **Quyền lợi khác:** Tử vong hoặc tổn thương sức khỏe vĩnh viễn do ốm đau, bệnh tật, thai sản; trợ cấp thu nhập.

### BIỂU PHÍ BẢO HIỂM (VNĐ/NĂM)

| Loại phí | S-VIP | V-VIP | VIP |
| :--- | :---: | :---: | :---: |
| Bao gồm quyền lợi Thai sản | 47.529.000 | 25.173.000 | 16.124.000 |
| Không bao gồm quyền lợi Thai sản | 38.024.000 | 20.139.000 | 12.900.000 |

### THỜI GIAN CHỜ
- **Tai nạn:** Miễn thời gian chờ.
- **Bệnh thông thường:** Miễn thời gian chờ.
- **Bệnh có sẵn:** 365 ngày.
- **Bệnh đặc biệt:** 90 ngày (tử vong/thương tật), 365 ngày (quyền lợi khác).
- **Thai sản:** 270 ngày (sinh con), 60 ngày (biến chứng).

### HƯỚNG DẪN BỒI THƯỜNG
1. **Bảo lãnh viện phí:** Không phải thanh toán chi phí tại các bệnh viện liên kết (Vinmec, Việt Pháp, Hồng Ngọc, Tâm Anh...). Thời gian: T2-T7 (08h00 - 18h00).
2. **Thanh toán trực tiếp:** Khách hàng thanh toán trước và gửi hồ sơ bồi thường qua App MyBIC hoặc nộp trực tiếp tại văn phòng BIC. Hotline: 19009456.`,
      updated: "16/03/2026"
    },
    {
      cat: "BẢO HIỂM",
      name: "BIDV MetLife - Chủ động Tương lai",
      desc: "Sản phẩm bảo hiểm Liên kết chung đóng phí định kỳ giúp bạn chủ động bảo vệ tài chính, tích lũy và đầu tư cho tương lai bền vững.",
      features: [
        "Giải pháp toàn diện: Bảo vệ, tích lũy và đầu tư trong cùng một sản phẩm",
        "Linh hoạt: Lựa chọn mức bảo vệ (Số tiền bảo hiểm) và phí bảo hiểm phù hợp",
        "Tích lũy hiệu quả: Hưởng lãi suất đầu tư từ Quỹ liên kết chung",
        "Thưởng hấp dẫn: Thưởng duy trì hợp đồng và thưởng tri ân khách hàng",
        "Chủ động: Lựa chọn thời hạn bảo vệ và thời gian đóng phí linh hoạt",
        "Ưu tiên: Tích hợp thêm các sản phẩm bảo hiểm sức khỏe theo nhu cầu"
      ],
      cond: "Người được bảo hiểm từ 30 ngày tuổi đến 65 tuổi. Thời hạn bảo vệ đến 99 tuổi.",
      details: `### CHI TIẾT SẢN PHẨM BIDV METLIFE - CHỦ ĐỘNG TƯƠNG LAI

#### 1. QUYỀN LỢI BẢO HIỂM
- **Quyền lợi Đáo hạn:** Nhận toàn bộ Giá trị tài khoản Hợp đồng khi kết thúc thời hạn bảo hiểm.
- **Quyền lợi Tử vong/Thương tật toàn bộ vĩnh viễn:** Lựa chọn một trong hai quyền lợi:
    - **Quyền lợi Cơ bản:** Giá trị lớn hơn giữa Số tiền bảo hiểm và Giá trị tài khoản hợp đồng.
    - **Quyền lợi Nâng cao:** Tổng của Số tiền bảo hiểm và Giá trị tài khoản hợp đồng.
- **Quyền lợi Đầu tư:** Hưởng lãi suất tích lũy từ kết quả đầu tư của Quỹ liên kết chung, được công bố hàng tháng.

#### 2. CÁC KHOẢN THƯỞNG HẤP DẪN
- **Thưởng duy trì hợp đồng:** Tự động cộng vào Giá trị tài khoản cơ bản mỗi 05 năm (vào các năm 10, 15, 20, 25, 30). Mức thưởng lên đến **25%** phí bảo hiểm cơ bản năm đầu.
- **Thưởng tri ân khách hàng:** Cộng vào Giá trị tài khoản cơ bản tại năm hợp đồng thứ 30 hoặc thời điểm đáo hạn. Mức thưởng bằng **1%** Giá trị tài khoản cơ bản.

#### 3. THÔNG TIN CHUNG & BIỂU PHÍ
- **Tuổi tham gia:** 30 ngày tuổi - 65 tuổi.
- **Thời hạn bảo hiểm:** Đến khi Người được bảo hiểm đạt 99 tuổi.
- **Thời hạn đóng phí tối thiểu:** 03 năm.
- **Định kỳ đóng phí:** Năm, nửa năm, quý.
- **Các loại phí:**
    - Phí ban đầu: Khấu trừ từ phí bảo hiểm thu được (giảm dần theo năm).
    - Phí bảo hiểm rủi ro: Khấu trừ hàng tháng để đảm bảo quyền lợi bảo hiểm.
    - Phí quản lý hợp đồng: Tối đa 60.000 đồng/tháng.
    - Phí quản lý quỹ: Tối đa 2%/năm.
    - Phí chấm dứt hợp đồng trước hạn: Áp dụng trong 5 năm đầu tiên.

*Sản phẩm được phê duyệt theo Công văn số 8810/BTC-QLBH của Bộ Tài chính ngày 20/06/2025.*`,
      updated: "16/03/2026"
    },
    {
      cat: "THẺ ĐỊNH DANH",
      name: "BIDV Premier Visa Signature",
      desc: "Trải nghiệm đặc quyền đẳng cấp dành riêng cho khách hàng phân khúc BIDV Premier với thẻ Visa Signature.",
      features: [
        "Miễn phí: Phí phát hành, Phí thường niên, Phí phạt chậm thanh toán",
        "Tích điểm tối đa 1 triệu đồng/tháng: 5% tại Bệnh viện/Fitness, 2% cho Bảo hiểm",
        "Hoàn tiền 0.1% không giới hạn cho các chi tiêu khác",
        "Đặc quyền Bác sĩ gia đình: Tư vấn sức khỏe 24/7, tặng 02 gói xét nghiệm máu",
        "Đặc quyền Phong cách sống: Tặng 05 lượt phòng chờ sân bay quốc nội/năm",
        "Bảo hiểm du lịch toàn cầu với mức bồi thường tối đa 500.000 USD"
      ],
      cond: "Khách hàng định danh phân khúc BIDV Premier theo quy định từng thời kỳ.",
      details: `### TRỌN BỘ ĐẶC QUYỀN ĐẲNG CẤP BIDV PREMIER

#### 1. CHÍNH SÁCH PHÍ & TÍCH ĐIỂM
- **Miễn phí hoàn toàn:** Phí phát hành, Phí thường niên, Phí phạt chậm thanh toán.
- **Cơ chế tích điểm (Tối đa 1.000.000đ/tháng):**
    - **5%:** Chi tiêu tại Bệnh viện, Fitness.
    - **2%:** Chi tiêu Bảo hiểm (tối đa 200.000đ/tháng/thẻ).
    - **0.1%:** Hoàn tiền không giới hạn cho các chi tiêu khác.
- **Đổi quà linh hoạt:** Tích điểm không giới hạn thời gian, dễ dàng đổi quà/hoàn tiền trên SmartBanking.

#### 2. ĐẶC QUYỀN BÁC SĨ GIA ĐÌNH
- **Tư vấn sức khỏe:** Không giới hạn số lần qua hotline riêng hoặc ứng dụng di động.
- **Hồ sơ bệnh án điện tử:** Lưu trữ và tra cứu tình trạng sức khỏe thường xuyên.
- **Xét nghiệm tại nhà:** Tặng 02 gói xét nghiệm 25 chỉ số máu.
- **Dịch vụ giao thuốc:** Giảm giá đến 20% và miễn phí vận chuyển tận nhà.
- **Hỗ trợ chuyên sâu:** Tìm kiếm chuyên gia, đặt lịch khám, trợ lý y khoa đi kèm tại Việt Nam và nước ngoài.

#### 3. ĐẶC QUYỀN PHONG CÁCH SỐNG
- **Phòng chờ sân bay:** Tặng 05 lượt sử dụng phòng chờ hạng thương gia quốc nội.
- **Ưu đãi sức khỏe:** Tặng 02 lượt giảm giá 50% (tối đa 1tr) cho giao dịch từ 2tr tại các đơn vị y tế.
- **Đặc quyền theo doanh số:**
    - Chi tiêu từ 30 - <100tr/quý: Tặng 1 lượt phòng chờ (tối đa 3 lượt/quý).
    - Chi tiêu từ 100tr/quý: Tặng 1 lượt ẩm thực cao cấp (tối đa 3.5tr/lượt).

#### 4. ĐẶC QUYỀN BẢO HIỂM
- **Bảo hiểm du lịch:** Mức trách nhiệm tối đa **500.000 USD** cho chủ thẻ và người thân trên mọi chuyến đi.`,
      updated: "15/03/2026"
    },
    {
      cat: "THẺ ĐỊNH DANH",
      name: "Đặc quyền BIDV Premier Elite",
      desc: "Trải nghiệm đặc quyền đẳng cấp dành riêng cho khách hàng phân khúc BIDV Premier Elite.",
      features: [
        "Đặc quyền Bác sĩ gia đình: Tư vấn 24/7, xét nghiệm máu tại nhà, tầm soát gen ung thư",
        "Đặc quyền Phong cách sống: Tặng không giới hạn lượt phòng chờ sân bay quốc tế & quốc nội",
        "Đặc quyền Nghỉ dưỡng: Tặng 01 đêm nghỉ dưỡng cao cấp tại hệ thống Resort/Khách sạn 5 sao",
        "Đặc quyền Sức khỏe: Tặng gói khám sức khỏe tổng quát định kỳ hàng năm",
        "Đặc quyền Ẩm thực: Tặng lượt thưởng thức ẩm thực cao cấp trị giá 3.500.000đ/lượt",
        "Bảo hiểm du lịch toàn cầu: Mức trách nhiệm tối đa 500.000 USD"
      ],
      cond: "Khách hàng định danh phân khúc BIDV Premier Elite theo quy định của BIDV.",
      details: `### TRỌN BỘ ĐẶC QUYỀN ĐẲNG CẤP BIDV PREMIER ELITE

#### 1. ĐẶC QUYỀN BÁC SĨ GIA ĐÌNH
- **Tư vấn sức khỏe:** Không giới hạn số lần qua hotline riêng hoặc ứng dụng di động.
- **Hồ sơ bệnh án điện tử:** Lưu trữ và tra cứu tình trạng sức khỏe thường xuyên.
- **Dịch vụ xét nghiệm tại nhà:**
    - Tặng 02 gói xét nghiệm 25 chỉ số máu.
    - Tặng 01 gói xét nghiệm 1 loại gen ung thư HOẶC 01 gói đánh giá sức khỏe tinh thần.
- **Dịch vụ giao thuốc:** Giảm giá đến 20% giá thuốc và miễn phí vận chuyển tận nhà.
- **Hỗ trợ chuyên sâu:** Tìm kiếm chuyên gia, đặt lịch khám, trợ lý y khoa đi kèm tại Việt Nam và nước ngoài.

#### 2. ĐẶC QUYỀN PHONG CÁCH SỐNG
- **Phòng chờ sân bay:** Tặng **KHÔNG GIỚI HẠN** lượt sử dụng phòng chờ hạng thương gia (ga quốc nội và quốc tế).
- **Nghỉ dưỡng cao cấp:** Tặng 01 đêm nghỉ dưỡng dành cho 2 người khi đặt từ 02 đêm trở lên tại hệ thống Resort/Khách sạn cao cấp tại Việt Nam.
- **Sức khỏe:** Tặng gói khám sức khỏe tổng quát dành cho 01 người tại các bệnh viện/phòng khám cao cấp tại Việt Nam.

#### 3. ĐẶC QUYỀN THEO DOANH SỐ CHI TIÊU THẺ
- **Phòng chờ bổ sung:** Tặng 1 lượt phòng chờ quốc nội với mỗi tổng doanh số chi tiêu 30 triệu đồng (khi chi tiêu từ 30 - dưới 100 triệu/quý, tối đa 3 lượt/quý).
- **Ẩm thực cao cấp:** Tặng 1 lượt sử dụng đặc quyền Ẩm thực tối đa **3.500.000đ/lượt** khi tổng doanh số chi tiêu từ 100 triệu/quý (tối đa 1 lượt/quý).

#### 4. ĐẶC QUYỀN BẢO HIỂM
- **Bảo hiểm du lịch:** An tâm trên mọi chuyến đi với mức bảo hiểm du lịch tối đa **500.000 USD** và các quyền lợi hấp dẫn khác.`,
      updated: "16/03/2026"
    },
    {
      cat: "THẺ ĐỊNH DANH",
      name: "BIDV Private Banking Visa Infinite",
      desc: "Dòng thẻ tín dụng cao cấp bậc nhất dành riêng cho khách hàng BIDV Private Banking với những đặc quyền vượt trội.",
      features: [
        "Miễn phí: Phí phát hành, Phí thường niên, Phí phạt chậm thanh toán",
        "Tích điểm 6% (tối đa 4 triệu điểm/tháng) tại Spa, Golf, Nghỉ dưỡng, Miễn thuế nước ngoài",
        "Đặc quyền Bác sĩ gia đình chuyên trách: Thăm khám tại nhà, tư vấn 24/7, xét nghiệm 32 chỉ số",
        "Đặc quyền Phong cách sống: 10 lượt Golf miễn phí hoặc Gói dịch vụ cao cấp (Phòng chờ, Nghỉ dưỡng, Sức khỏe)",
        "Đặc quyền Next Gen Future Leader: Chương trình phát triển năng lực thế hệ tương lai",
        "Bảo hiểm du lịch toàn cầu: Mức trách nhiệm tối đa 1.000.000 USD"
      ],
      cond: "Khách hàng định danh phân khúc BIDV Private Banking theo quy định của BIDV.",
      details: `### TRẢI NGHIỆM TINH HOA DÀNH CHO KHÁCH HÀNG PRIVATE BANKING

#### 1. CHÍNH SÁCH PHÍ & TÍCH ĐIỂM
- **Miễn phí hoàn toàn:** Phí phát hành, Phí thường niên, Phí phạt chậm thanh toán.
- **Cơ chế tích điểm (Tối đa 4.000.000 điểm/tháng):**
    - **6%:** Chi tiêu tại Spa, Golf, Khu nghỉ dưỡng, Cửa hàng miễn thuế tại nước ngoài.
    - **0.1%:** Hoàn tiền không giới hạn cho các chi tiêu khác.

#### 2. ĐẶC QUYỀN BÁC SĨ GIA ĐÌNH CHUYÊN TRÁCH
- **Bác sĩ chuyên trách:** Khách hàng được chăm sóc thường xuyên bởi bác sĩ riêng có trình độ chuyên môn cao.
- **Thăm khám tại nhà:** 02 lần/năm cho khách hàng và các thành viên trong gia đình.
- **Tư vấn sức khỏe:** 24/7 qua hotline riêng hoặc ứng dụng di động.
- **Xét nghiệm tại nhà:**
    - Tặng 02 gói xét nghiệm 32 chỉ số máu.
    - Tặng 01 gói xét nghiệm 03 loại gen ung thư HOẶC 01 gói đánh giá sức khỏe tinh thần và 01 buổi tư vấn tâm lý.
    - Tặng 01 gói tiêm Cúm mùa.
- **Dịch vụ giao thuốc:** Giảm giá đến 20% và miễn phí vận chuyển tận nhà.

#### 3. ĐẶC QUYỀN PHONG CÁCH SỐNG (CHỌN 1 TRONG 2)
- **Lựa chọn 1: Đặc quyền dành cho Golfer**
    - Tặng 10 lượt chơi Golf miễn phí (bao gồm Green fee, Caddy và Buggy).
- **Lựa chọn 2: Gói dịch vụ cao cấp**
    - **Phòng chờ & Hỗ trợ hàng không:** Không giới hạn lượt sử dụng phòng chờ và dịch vụ hỗ trợ thủ tục hàng không (Fast track) tại ga quốc nội và quốc tế.
    - **Nghỉ dưỡng:** Tặng 01 đêm nghỉ dưỡng dành cho 2 người tại hệ thống Resort/Khách sạn cao cấp.
    - **Sức khỏe:** Tặng gói khám sức khỏe cao cấp tại Việt Nam/Singapore/Nhật Bản.

#### 4. ĐẶC QUYỀN NEXT GEN FUTURE LEADER
*(Dành cho khách hàng có tổng tài sản từ 100 tỷ đồng)*
- Chương trình phát triển năng lực thế hệ tương lai (Next-gen Navigator).
- Chương trình thực tập tại các Tập đoàn/Doanh nghiệp hàng đầu Việt Nam.
- Hội thảo & Sự kiện tại Việt Nam và Nước ngoài.
- Kho thư viện kiến thức từ các đơn vị đào tạo hàng đầu thế giới.

#### 5. ĐẶC QUYỀN BẢO HIỂM
- **Bảo hiểm du lịch:** Mức trách nhiệm tối đa **1.000.000 USD**.
- **Y tế khẩn cấp:** Trị giá 25.000 USD và các quyền lợi hấp dẫn khác.`,
      updated: "16/03/2026"
    },
    {
      cat: "THẺ TÍN DỤNG",
      name: "BIDV JCB Ultimate",
      desc: "Thẻ tín dụng cao cấp hạng Ultimate mang đến những đặc quyền ẩm thực và phong cách sống thượng lưu tại Việt Nam và Nhật Bản.",
      features: [
        "Hoàn tiền ẩm thực lên đến 20% (tối đa 800.000 VND/tháng)",
        "Miễn phí phòng chờ sân bay quốc nội & quốc tế tại Việt Nam",
        "Đặc quyền Meet & Greet: Đón tiễn ưu tiên tại 5 sân bay quốc tế",
        "Ưu đãi Golf: Giảm 1.000.000 VND/lượt chơi tại 60 sân Golf Việt Nam",
        "Ẩm thực Michelin: Giảm 1.000.000 VND cho hóa đơn từ 2.000.000 VND",
        "Miễn 100% phí chuyển đổi ngoại tệ khi chi tiêu tại Nhật Bản",
        "Chăm sóc sức khỏe: Giảm đến 30% tại các phòng khám VN & Nhật Bản"
      ],
      cond: "Cá nhân từ 15 tuổi trở lên. Người nước ngoài cư trú tại Việt Nam từ 12 tháng trở lên.",
      details: `### ĐẶC QUYỀN THƯỢNG LƯU DÀNH CHO CHỦ THẺ BIDV JCB ULTIMATE

#### 1. CHƯƠNG TRÌNH HOÀN TIỀN ẨM THỰC
- **Tỷ lệ hoàn tiền (Tối đa 800.000 VND/tháng):**
    - **20%:** Chi tiêu ẩm thực tại Việt Nam trong tháng sinh nhật.
    - **10%:** Chi tiêu ẩm thực tại Việt Nam trong các tháng khác.
    - **15%:** Chi tiêu ẩm thực qua máy POS tại Nhật Bản.

#### 2. CHƯƠNG TRÌNH ĐẶC QUYỀN JCB ULTIMATE
- **Phòng chờ sân bay:** Miễn phí sử dụng phòng chờ hạng thương gia tại Việt Nam (ga nội địa và quốc tế).
- **Meet & Greet:** Miễn phí dịch vụ đón tiễn ưu tiên tại 5 sân bay quốc tế lớn tại Việt Nam.
- **Golf:** Ưu đãi giảm **1.000.000 VND/lượt** chơi tại 60 sân Golf đẹp nhất Việt Nam và giá ưu đãi tại các sân Golf Nhật Bản.
- **Khách sạn & Resort:** Tặng 01 đêm nghỉ khi đặt ít nhất 02 đêm tại 40 Khách sạn & Resort cao cấp tại Việt Nam.
- **Ẩm thực cao cấp:** Giảm **1.000.000 VND** cho hóa đơn từ 2.000.000 VND tại hơn 30 nhà hàng Nhật Bản cao cấp và nhà hàng Michelin tại Việt Nam.

#### 3. ƯU ĐÃI TẠI NHẬT BẢN
- **Phí giao dịch:** Hoàn 100% phí chuyển đổi ngoại tệ (1%) khi chi tiêu tại Nhật Bản.
- **Sức khỏe:** Giảm đến 30% tại các phòng khám uy tín tại Nhật Bản.

#### 4. BIỂU PHÍ & HẠN MỨC
- **Phí thường niên:**
    - Thẻ chính: 1.500.000 VND/năm.
    - Thẻ phụ: 600.000 VND/năm.
- **Điều kiện miễn phí thường niên năm tiếp theo:**
    - KH nội bộ/KHCC: Chi tiêu từ 10.000.000 VND/năm.
    - KH lương/Tiểu thương/Vay/Chuyển tiền: Chi tiêu từ 50.000.000 VND/năm.
    - KH thông thường: Chi tiêu từ 150.000.000 VND/năm.
- **Hạn mức giao dịch:**
    - Thanh toán: Tối đa ~20 tỷ VND/ngày.
    - Ứng tiền mặt: 50% hạn mức tín dụng (Tối đa 5 tỷ VND/ngày).`,
      updated: "16/03/2026"
    },
    {
      cat: "SẢN PHẨM KHÁC",
      name: "Chuyển tiền quốc tế cá nhân",
      desc: "Dịch vụ chuyển tiền ra nước ngoài và nhận tiền từ nước ngoài nhanh chóng, an toàn qua hệ thống SWIFT, SmartBanking và Western Union.",
      features: [
        "Đa dạng kênh giao dịch: Tại quầy, SmartBanking, Western Union",
        "Mục đích chuyển tiền hợp pháp: Du học, chữa bệnh, du lịch, định cư...",
        "Biểu phí cạnh tranh: Chỉ từ 0.2% số tiền chuyển",
        "Ưu đãi đặc biệt: Miễn đến 100% phí chuyển tiền vào thứ 4 hàng tuần",
        "Giảm phí cho khách hàng cao cấp: Premier, Elite giảm 25%, Private miễn phí"
      ],
      cond: "Khách hàng cá nhân có nhu cầu chuyển/nhận tiền quốc tế hợp pháp. Cần chuẩn bị hồ sơ theo quy định (CCCD/Hộ chiếu, chứng từ mục đích...).",
      details: `### DỊCH VỤ CHUYỂN TIỀN QUỐC TẾ CÁ NHÂN – BIDV

#### 1. HÌNH THỨC CHUYỂN TIỀN
| Kênh giao dịch | Mô tả |
| :--- | :--- |
| **Tại quầy BIDV** | Chuyển tiền qua hệ thống SWIFT |
| **SmartBanking BIDV** | Chuyển tiền quốc tế online |
| **Western Union** | Chuyển tiền nhanh toàn cầu |

#### 2. MỤC ĐÍCH CHUYỂN TIỀN HỢP PHÁP
Cá nhân được phép chuyển tiền ra nước ngoài cho các mục đích:
- Du học (học phí, sinh hoạt phí).
- Chữa bệnh.
- Du lịch / công tác.
- Trợ cấp thân nhân.
- Thanh toán chi phí nước ngoài.
- Định cư / thừa kế.

#### 3. HỒ SƠ CẦN CHUẨN BỊ
- **Giấy tờ cá nhân:** CCCD / Hộ chiếu.
- **Tài khoản ngân hàng:** Tài khoản BIDV.
- **Chứng từ mục đích:** Thư nhập học, hóa đơn viện phí, hợp đồng thuê nhà…
- **Thông tin người nhận:** Tên, địa chỉ, ngân hàng, SWIFT code.

#### 4. BIỂU PHÍ CHUYỂN TIỀN QUỐC TẾ (SWIFT)
- **Phí chuyển tiền:** 0,2% số tiền chuyển (Min 5 USD - Max 5.000 USD).
- **Điện phí:** 5 USD.
- **Phí OUR (Cam kết người nhận đủ tiền):**
    - Giao dịch đến thị trường Mỹ: 6 USD.
    - Giao dịch cam kết người hưởng nhận nguyên số tiền: 22 USD.
- **Ưu đãi:** Giảm 25% phí cho KH Premier/Elite, miễn phí cho KH Private.

#### 5. PHÍ NHẬN TIỀN TỪ NƯỚC NGOÀI
- **Nhận vào tài khoản:** 0,03% (Min 2 USD – Max 70 USD).
- **Nhận tiền mặt:** 0,05% (Min 2 USD – Max 100 USD).

#### 6. THỜI GIAN XỬ LÝ & ƯU ĐÃI
- **Thời gian:** Châu Á (1-2 ngày), Châu Âu/Mỹ/Úc (2-3 ngày).
- **Ưu đãi:** Miễn đến 100% phí chuyển tiền vào thứ 4 hàng tuần (đến 30/04/2026).

#### 7. LƯU Ý QUAN TRỌNG
- Có thể phát sinh phí ngân hàng trung gian.
- **Loại phí:**
    - **OUR:** Người gửi trả toàn bộ phí.
    - **SHA:** Chia phí.
    - **BEN:** Người nhận trả phí.`,
      updated: "16/03/2026"
    },
    {
      cat: "SẢN PHẨM KHÁC",
      name: "Giải pháp Hộ kinh doanh",
      desc: "Hệ sinh thái giải pháp quản lý dòng tiền và tài chính toàn diện dành riêng cho khách hàng Hộ kinh doanh.",
      features: [
        "Tài khoản thanh toán: Nhận tới 230.000đ khi đăng ký mới SmartBanking",
        "Miễn/Giảm phí tài khoản số đẹp dành cho Hộ kinh doanh",
        "Vay SXKD: Lãi suất chỉ từ 5.1%/năm, thấu chi đến 5 tỷ đồng",
        "Loa thanh toán & Phần mềm: Miễn phí trọn đời MyShop Pro (đăng ký 2025)",
        "Ưu đãi thẻ tín dụng: Hoàn tiền đến 1.000.000đ khi mở mới",
        "Miễn phí chia sẻ thông báo biến động số dư cho nhân viên",
        "Ưu đãi lãi suất tiền gửi thanh toán: 0.5%/năm"
      ],
      cond: "Dành cho khách hàng Hộ kinh doanh có nhu cầu quản lý dòng tiền và tài chính.",
      details: `### GIẢI PHÁP TOÀN DIỆN DÀNH CHO HỘ KINH DOANH

#### 1. KHUYẾN MẠI TÀI KHOẢN THANH TOÁN
- **SmartBanking:** Nhận tối đa **230.000đ** khi đăng ký mới.
- **Giới thiệu bạn bè:** Cơ hội nhận thưởng hơn **3.000.000đ** khi giới thiệu khách hàng mới.
- **Tài khoản số đẹp:** Miễn/Giảm phí chọn số đẹp dành riêng cho Hộ kinh doanh.
- **Lãi suất tiền gửi:** Ưu đãi lãi suất **0.5%/năm** trên tài khoản thanh toán (không yêu cầu số dư tối thiểu).

#### 2. LOA THANH TOÁN & PHẦN MỀM BÁN HÀNG
- **Phần mềm MyShop Pro (của BIDV):**
    - **Miễn phí trọn đời** cho khách hàng đăng ký trong năm 2025.
    - Quản lý sổ sách, hóa đơn, kê khai thuế dễ dàng.
    - Miễn phí 06 tháng chữ ký số & 3.000 hóa đơn điện tử.
- **Loa QR:** Tặng tiền lên đến **300.000đ** khi liên kết lần đầu.
- **PMQLBH đối tác:** Hoàn tiền lên đến **1.000.000đ** khi liên kết lần đầu với tài khoản BIDV.

#### 3. GIẢI PHÁP TÍN DỤNG (VAY SXKD)
- **Lãi suất:** Chỉ từ **5.1%/năm**.
- **Vay thấu chi:** Hạn mức lên đến **5 tỷ đồng** với lãi suất cạnh tranh.
- **Mục đích:** Bổ sung vốn lưu động, đầu tư tài sản cố định phục vụ SXKD.

#### 4. ƯU ĐÃI THẺ TÍN DỤNG & POS
- **Thẻ tín dụng:**
    - Miễn phí phát hành và phí thường niên năm đầu.
    - Hoàn tiền đến **1.000.000đ** khi mở mới thẻ.
    - Cashback tối đa **800.000đ/tháng**.
- **Dịch vụ POS & Trả góp:**
    - Lãi suất trả góp ưu đãi từ **1.35%/giao dịch**.
    - Kỳ hạn linh hoạt từ 3 - 24 tháng.

#### 5. QUẢN LÝ DÒNG TIỀN THÔNG MINH
- **Chia sẻ biến động số dư:** Miễn phí chia sẻ thông báo biến động số dư (OTT) trên SmartBanking cho nhân viên, giúp chủ cửa hàng quản lý doanh thu mà vẫn đảm bảo bảo mật số dư tài khoản.`,
      updated: "18/03/2026"
    }
  ];

  for (const item of items) {
    const exists = db.prepare("SELECT id FROM items WHERE name = ?").get(item.name);
    if (!exists) {
      const catId = getCatId(item.cat);
      const res = insertItem.run(catId, item.name, item.desc, JSON.stringify(item.features), item.cond, (item as any).details || null, item.updated);
      console.log(`Inserted item: ${item.name}`);
      
      if (item.name === "Biểu lãi suất niêm yết") {
        insertQA.run(
          res.lastInsertRowid,
          "Lãi suất niêm yết có thay đổi thường xuyên không?",
          "Lãi suất được điều chỉnh dựa trên chính sách tiền tệ của Ngân hàng Nhà nước và tình hình thị trường. Biểu lãi suất trên có hiệu lực từ 16/01/2026."
        );
      }
    }
  }
}

seed();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    const items = db.prepare("SELECT * FROM items").all();
    
    const result = categories.map((cat: any) => ({
      ...cat,
      items: items.filter((item: any) => item.categoryId === cat.id)
    }));
    
    res.json(result);
  });

  app.get("/api/items/:id", (req, res) => {
    const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id) as any;
    if (item) {
      item.features = JSON.parse(item.features || "[]");
      const qa = db.prepare("SELECT * FROM qa WHERE itemId = ?").all(req.params.id);
      res.json({ ...item, qa });
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  });

  app.post("/api/items", (req, res) => {
    const { categoryId, name, description, features, conditions, details, lastUpdated } = req.body;
    const info = db.prepare(
      "INSERT INTO items (categoryId, name, description, features, conditions, details, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(categoryId, name, description, JSON.stringify(features || []), conditions, details || null, lastUpdated);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/items/:id", (req, res) => {
    const { categoryId, name, description, features, conditions, details, lastUpdated } = req.body;
    db.prepare(
      "UPDATE items SET categoryId = ?, name = ?, description = ?, features = ?, conditions = ?, details = ?, lastUpdated = ? WHERE id = ?"
    ).run(categoryId, name, description, JSON.stringify(features || []), conditions, details || null, lastUpdated, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/items/:id", (req, res) => {
    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM qa WHERE itemId = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/qa", (req, res) => {
    const { itemId, question, answer } = req.body;
    const info = db.prepare("INSERT INTO qa (itemId, question, answer) VALUES (?, ?, ?)").run(itemId, question, answer);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
