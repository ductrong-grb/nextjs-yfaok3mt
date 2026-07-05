import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
      const { password } = await req.json();
          const adminPassword = process.env.ADMIN_PASSWORD;
              if (password !== adminPassword) {
                    return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
                        }

                            const token = signAdminToken();
                                const response = NextResponse.json({ success: true });
                                    response.cookies.set('admin_token', token, {
                                          httpOnly: true,
                                                secure: process.env.NODE_ENV === 'production',
                                                      sameSite: 'lax',
                                                            maxAge: 60 * 60,
                                                                  path: '/',
                                                                      });
                                                                          return response;
                                                                            } catch (error) {
                                                                                return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
                                                                                  }
                                                                                  }