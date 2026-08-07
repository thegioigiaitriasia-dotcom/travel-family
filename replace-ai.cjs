const fs = require('fs');

function updateFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  const startStr = 'const apiKey = process.env.GEMINI_API_KEY;';
  const endStr = 'const parsedPlan = JSON.parse(jsonText);';

  const startIndex = code.indexOf(startStr);
  const endIndex = code.indexOf(endStr) + endStr.length;

  if (startIndex !== -1 && endIndex !== -1) {
    const newChunk = `const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error('[DeepSeek API] API KEY environment variable is not set.');
        return res.status(500).json({
          success: false,
          error: 'DEEPSEEK_API_KEY chưa được cấu hình trên server. Vui lòng thêm vào file .env',
        });
      }

      const startTime24h = tripInput.tripWindow?.startTime || '07:00';
      const endTime24h = tripInput.tripWindow?.endTime || '20:00';

      const prompt = \`Bạn là Chuyên gia Lập Lịch Trình Du Lịch Gia Đình Việt Nam cao cấp (AI Family Travel Planner).
Hãy tạo một Kế hoạch chuyến đi du lịch gia đình đa chặng / đa điểm đến dựa trên thông tin chi tiết được cung cấp:

THÔNG TIN CHUYẾN ĐI:
- Khung thời gian: Từ \${tripInput.tripWindow?.startDate || 'ngày xuất phát'} (Giờ khởi hành: \${startTime24h}) đến \${tripInput.tripWindow?.endDate || 'ngày về'} (Giờ kết thúc: \${endTime24h})
- Các điểm dừng trong lộ trình: \${JSON.stringify(tripInput.routeStops || [])}
- Phương tiện di chuyển các chặng: \${JSON.stringify(tripInput.journeyLegs || [])}
- Nơi lưu trú từng điểm: \${JSON.stringify(tripInput.accommodations || [])}
- Thành viên gia đình: \${JSON.stringify(tripInput.travelers || {})}
- Nhu cầu đặc biệt & sức khỏe: \${JSON.stringify(tripInput.mobilityAndComfortNeeds || [])} - \${tripInput.specialNote || ''}
- Phong cách du lịch & Nhịp độ: Nhịp độ \${tripInput.pace || 'balanced'}, Gu: \${JSON.stringify(tripInput.travelStyles || [])}
- Điều tránh: \${JSON.stringify(tripInput.avoidPreferences || [])}
- Sở thích ăn uống: \${JSON.stringify(tripInput.foodPreferences || [])}
- Ngân sách toàn chuyến: Tổng \${tripInput.budget?.total?.toLocaleString('vi-VN') || '20.000.000'} VND (Đã trả trước: \${JSON.stringify(tripInput.budget?.alreadyPaid || {})})

QUY TẮC QUAN TRỌNG VỀ THỜI GIAN:
1. Tất cả các trường "startTime" và "endTime" PHẢI ở định dạng 24 giờ (HH:MM), ví dụ "08:30", "13:00", "19:45".
2. Ngày 1: Hoạt động đầu tiên PHẢI bắt đầu đúng vào giờ khởi hành "\${startTime24h}".
3. Ngày cuối: Hoạt động cuối cùng PHẢI kết thúc trước hoặc đúng giờ kết thúc "\${endTime24h}".
4. Các ngày còn lại: Thường bắt đầu lúc 07:00 và kết thúc lúc 21:00-22:00 (sau bữa tối).
5. Mỗi hoạt động phải có CẢ startTime VÀ endTime hợp lý (ví dụ: tham quan 1.5-2 tiếng, ăn uống 1 tiếng, di chuyển phù hợp với khoảng cách).
6. Các hoạt động phải nối tiếp nhau liên tục, không có khoảng trống thời gian vô lý.

YÊU CẦU ĐẦU RA JSON TỰ ĐỘNG:
Hãy trả về JSON duy nhất với cấu trúc sau (không kèm markdown format ngoài):
{
  "title": "Tên hấp dẫn cho chuyến đi gia đình",
  "totalDays": 3,
  "summary": "Tóm tắt ngắn gọn 2-3 câu về hành trình",
  "familyAdvice": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "cityName": "Tên thành phố/điểm dừng",
      "theme": "Chủ đề ngày",
      "activities": [
        {
          "startTime": "08:30",
          "endTime": "10:00",
          "title": "Tên hoạt động/địa điểm",
          "category": "Attraction", 
          "description": "Mô tả chi tiết và lưu ý gia đình",
          "locationName": "Tên địa danh cụ thể",
          "estimatedCost": "Chi phí ước tính VND (ví dụ: 200.000đ)",
          "familyTip": "Lưu ý riêng cho gia đình"
        }
      ]
    }
  ]
}\`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Bạn là chuyên gia thiết kế lịch trình. Luôn xuất kết quả dạng JSON nguyên bản hợp lệ, không dùng code block markdown.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
         const errorData = await response.json();
         console.error('DeepSeek Error:', errorData);
         throw new Error(errorData.error?.message || 'Lỗi khi gọi DeepSeek API');
      }

      const resData = await response.json();
      let jsonText = resData.choices[0].message.content;
      // Trích xuất JSON nếu API vẫn trả về dạng code block
      if (jsonText.startsWith('\`\`\`')) {
         const match = jsonText.match(/\`\`\`(json)?([\\s\\S]*?)\`\`\`/);
         if (match) jsonText = match[2].trim();
      }
      
      const parsedPlan = JSON.parse(jsonText);`;

    code = code.substring(0, startIndex) + newChunk + code.substring(endIndex);
    fs.writeFileSync(filename, code);
    console.log(`Updated ${filename} successfully`);
  } else {
    console.error(`Could not find replace chunk in ${filename}`);
  }
}

updateFile('server.ts');
