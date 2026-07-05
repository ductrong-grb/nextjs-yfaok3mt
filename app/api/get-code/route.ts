import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ZALO-';
      for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
              return code;
              }

              export async function POST(req: NextRequest) {
                try {
                    const { userId } = await req.json();
                        if (!userId) {
                              return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
                                  }

                                      // Kiểm tra user
                                          const { data: user, error: fetchError } = await supabaseAdmin
                                                .from('zalo_users')
                                                      .select('verification_code, status')
                                                            .eq('id', userId)
                                                                  .single();

                                                                      if (fetchError || !user) {
                                                                            return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
                                                                                }

                                                                                    // Nếu đã có mã thì trả về luôn
                                                                                        if (user.verification_code) {
                                                                                              return NextResponse.json({ code: user.verification_code });
                                                                                                  }

                                                                                                      // Tạo mã mới (đảm bảo duy nhất)
                                                                                                          let newCode = generateCode();
                                                                                                              let unique = false;
                                                                                                                  let attempts = 0;
                                                                                                                      while (!unique && attempts < 10) {
                                                                                                                            const { data: existing } = await supabaseAdmin
                                                                                                                                    .from('zalo_users')
                                                                                                                                            .select('verification_code')
                                                                                                                                                    .eq('verification_code', newCode)
                                                                                                                                                            .maybeSingle();
                                                                                                                                                                  if (!existing) {
                                                                                                                                                                          unique = true;
                                                                                                                                                                                } else {
                                                                                                                                                                                        newCode = generateCode();
                                                                                                                                                                                                attempts++;
                                                                                                                                                                                                      }
                                                                                                                                                                                                          }
                                                                                                                                                                                                              if (!unique) {
                                                                                                                                                                                                                    return NextResponse.json({ error: 'Không thể tạo mã duy nhất' }, { status: 500 });
                                                                                                                                                                                                                        }

                                                                                                                                                                                                                            // Cập nhật user
                                                                                                                                                                                                                                const { error: updateError } = await supabaseAdmin
                                                                                                                                                                                                                                      .from('zalo_users')
                                                                                                                                                                                                                                            .update({ verification_code: newCode, status: 'completed' })
                                                                                                                                                                                                                                                  .eq('id', userId);

                                                                                                                                                                                                                                                      if (updateError) {
                                                                                                                                                                                                                                                            console.error('Update error:', updateError);
                                                                                                                                                                                                                                                                  return NextResponse.json({ error: 'Không thể cập nhật mã' }, { status: 500 });
                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                          return NextResponse.json({ code: newCode });
                                                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                                                console.error('Error in get-code:', error);
                                                                                                                                                                                                                                                                                    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                      }