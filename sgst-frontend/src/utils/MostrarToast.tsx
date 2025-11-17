import toast from 'react-hot-toast';

export const mostrarToast = (mensaje: string, tipo: "error" | "success") => {
    if (tipo == "error") toast.error(mensaje, {
        position: "bottom-right", style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        }
    })
    else toast.success(mensaje, {
        position: "bottom-right", style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        }
    })
}