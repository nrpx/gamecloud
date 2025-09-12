import { auth } from "@/auth"
 
export default auth((req) => {
  // req.auth содержит информацию о сессии
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/')
  
  // Если пользователь не авторизован и пытается попасть на защищенную страницу
  if (!isAuth && !isAuthPage) {
    return Response.redirect(new URL('/auth/signin', req.url))
  }
  
  // Если пользователь авторизован и пытается попасть на страницу входа
  if (isAuth && isAuthPage) {
    return Response.redirect(new URL('/', req.url))
  }
})
 
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
