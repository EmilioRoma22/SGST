/**
 * Ref para poder navegar desde fuera del árbol de React como el interceptor de axios.
 * Se asigna en App.tsx con useNavigate() para que el cliente HTTP pueda usar navigate().
 */
export const navigationRef: {
  current: ((to: string, options?: { replace?: boolean }) => void) | null
} = {
  current: null,
}
