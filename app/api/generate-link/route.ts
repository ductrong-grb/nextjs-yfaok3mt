import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
      const { zaloName, turnstileToken } = await req.json();

          if (!zaloName || !turnstileToken) {
                return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
                    }

                        // 1. Xác thực Turnstile
                            const turnstileSecret = process.env.TURNSTILE_SECRET_KEY!;
                                const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                                      method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                                  body: `secret=${turnstileSecret}&response=${turnstileToken}`,
                                                      });
                                                          const verifyData = await verifyRes.json();
                                                              if (!verifyData.success) {
                                                                    return NextResponse.json({ error: 'Xác thực Turnstile thất bại' }, { status: 400 });
                                                                        }

                                                                            // 2. Thêm user vào database
                                                                                const { data: user, error: insertError } = await supabaseAdmin
                                                                                      .from('zalo_users')
                                                                                            .insert({ zalo_name: zaloName, status: 'pending' })
                                                                                                  .select('id')
                                                                                                        .single();

                                                                                                            if (insertError || !user) {
                                                                                                                  console.error('Insert error:', insertError);
                                                                                                                        return NextResponse.json({ error: 'Không thể tạo bản ghi' }, { status: 500 });
                                                                                                                            }

                                                                                                                                const userId = user.id;

                                                                                                                                    // 3. Tạo đường dẫn quay về
                                                                                                                                        const baseUrl = req.nextUrl.origin;
                                                                                                                                            const returnUrl = `${baseUrl}/get-code?user_id=${userId}`;

                                                                                                                                                // 4. Rút gọn link qua Link4m (xử lý linh hoạt cấu trúc trả về)
                                                                                                                                                    const link4mToken = process.env.LINK4M_API_TOKEN!;
                                                                                                                                                        const link4mUrl = `https://link4m.com/api-url?token=${link4mToken}&url=${encodeURIComponent(returnUrl)}`;
                                                                                                                                                            
                                                                                                                                                                const link4mRes = await fetch(link4mUrl, {
                                                                                                                                                                      headers: {
                                                                                                                                                                              'Accept': 'application/json',
                                                                                                                                                                                    },
                                                                                                                                                                                        });
                                                                                                                                                                                            
                                                                                                                                                                                                if (!link4mRes.ok) {
                                                                                                                                                                                                      console.error('Link4m HTTP error:', link4mRes.status, link4mRes.statusText);
                                                                                                                                                                                                            return NextResponse.json({ error: 'Link4m API không phản hồi' }, { status: 500 });
                                                                                                                                                                                                                }

                                                                                                                                                                                                                    let link4mData;
                                                                                                                                                                                                                        try {
                                                                                                                                                                                                                              link4mData = await link4mRes.json();
                                                                                                                                                                                                                                  } catch (parseError) {
                                                                                                                                                                                                                                        console.error('Link4m JSON parse error:', parseError);
                                                                                                                                                                                                                                              return NextResponse.json({ error: 'Dữ liệu Link4m không hợp lệ' }, { status: 500 });
                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                      // Kiểm tra cả hai trường có thể có: .short_url hoặc .url
                                                                                                                                                                                                                                                          const shortLink = link4mData.short_url || link4mData.url;
                                                                                                                                                                                                                                                              if (!shortLink) {
                                                                                                                                                                                                                                                                    console.error('Link4m missing short URL:', link4mData);
                                                                                                                                                                                                                                                                          return NextResponse.json({ error: 'Không lấy được link rút gọn' }, { status: 500 });
                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                  return NextResponse.json({ link: shortLink });
                                                                                                                                                                                                                                                                                    } catch (error) {
                                                                                                                                                                                                                                                                                        console.error('Error in generate-link:', error);
                                                                                                                                                                                                                                                                                            return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                              }