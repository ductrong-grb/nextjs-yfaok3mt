import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
      const token = req.cookies.get('admin_token')?.value;
          if (!token || !verifyAdminToken(token)) {
                return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
                    }

                        const { code } = await req.json();
                            if (!code) {
                                  return NextResponse.json({ error: 'Thiếu mã' }, { status: 400 });
                                      }

                                          const { data: user, error } = await supabaseAdmin
                                                .from('zalo_users')
                                                      .select('id, zalo_name, status')
                                                            .eq('verification_code', code)
                                                                  .maybeSingle();

                                                                      if (error || !user) {
                                                                            return NextResponse.json({ error: 'Mã không tồn tại hoặc giả mạo!' }, { status: 404 });
                                                                                }

                                                                                    if (user.status === 'used') {
                                                                                          return NextResponse.json({ error: 'Mã này đã được sử dụng trước đó! Cảnh báo gian lận.' }, { status: 400 });
                                                                                              }

                                                                                                  const { error: updateError } = await supabaseAdmin
                                                                                                        .from('zalo_users')
                                                                                                              .update({ status: 'used' })
                                                                                                                    .eq('id', user.id);

                                                                                                                        if (updateError) {
                                                                                                                              console.error('Update error:', updateError);
                                                                                                                                    return NextResponse.json({ error: 'Lỗi cập nhật trạng thái' }, { status: 500 });
                                                                                                                                        }

                                                                                                                                            return NextResponse.json({
                                                                                                                                                  success: true,
                                                                                                                                                        zaloName: user.zalo_name,
                                                                                                                                                              message: 'Mã hợp lệ! Đã xác thực thành viên.'
                                                                                                                                                                  });
                                                                                                                                                                    } catch (error) {
                                                                                                                                                                        console.error('Error in check-code:', error);
                                                                                                                                                                            return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
                                                                                                                                                                              }
                                                                                                                                                                              }