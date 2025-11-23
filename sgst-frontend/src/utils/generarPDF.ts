import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import type { OrdenDetallada } from "../services/interfaces";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import logoSgst from "../assets/sgst_logo_white.svg";

const cargarImagen = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

const getDataUrl = (img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    }
    return "";
};

export const generarPDFOrden = async (orden: OrdenDetallada): Promise<Blob> => {
    const doc = new jsPDF({
        format: 'letter',
        unit: 'mm'
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const colorDark = "#111827";
    const colorGray = "#6B7280";
    const colorLightGray = "#F3F4F6";
    const colorWhite = "#FFFFFF";

    doc.setFillColor(colorDark);
    doc.rect(0, 0, pageWidth, 40, "F");

    try {
        const img = await cargarImagen(logoSgst);
        const logoDataUrl = getDataUrl(img);

        const logoWidth = 35;
        const logoHeight = (img.height * logoWidth) / img.width;

        const logoY = (40 - logoHeight) / 2;
        const logoX = 15;

        doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        console.error("Error cargando logo:", error);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(colorWhite);
    doc.text("ORDEN DE SERVICIO", pageWidth - 15, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`NO. ORDEN: #${orden.num_orden}`, pageWidth - 15, 26, { align: "right" });
    doc.text(`FECHA: ${format(new Date(orden.fecha_creacion || new Date()), "dd/MM/yyyy", { locale: es })}`, pageWidth - 15, 32, { align: "right" });

    let currentY = 55;
    const margin = 15;

    const colWidth = (pageWidth - (margin * 3)) / 2;

    doc.setDrawColor(230);
    doc.setFillColor(colorWhite);

    doc.setFillColor(colorDark);
    doc.rect(margin, currentY, colWidth, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colorGray);
    doc.text("INFORMACIÓN DEL CLIENTE", margin, currentY - 3);

    let cardY = currentY + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colorDark);
    doc.text(`${orden.nombre_cliente} ${orden.apellidos_cliente}`, margin, cardY);

    cardY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(orden.telefono_cliente || "Sin teléfono", margin, cardY);
    cardY += 5;
    doc.text(orden.correo_cliente || "Sin correo", margin, cardY);
    cardY += 5;
    if (orden.direccion_cliente) {
        doc.setFontSize(9);
        doc.text(orden.direccion_cliente, margin, cardY, { maxWidth: colWidth - 5 });
    }

    const col2X = margin + colWidth + margin;

    doc.setFillColor(colorDark);
    doc.rect(col2X, currentY, colWidth, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colorGray);
    doc.text("DETALLES DEL EQUIPO", col2X, currentY - 3);

    cardY = currentY + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colorDark);
    const equipoTitulo = `${orden.nombre_tipo} ${orden.marca_equipo || ''}`.trim();
    doc.text(equipoTitulo, col2X, cardY);

    cardY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Modelo: ${orden.modelo_equipo || 'N/A'}`, col2X, cardY);
    cardY += 5;
    doc.text(`Serie: ${orden.num_serie || 'N/A'}`, col2X, cardY);

    currentY += 45;
    doc.setFillColor(colorLightGray);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colorDark);
    doc.text("REPORTE TÉCNICO Y FALLA", margin + 3, currentY + 5.5);

    currentY += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
    const splitFalla = doc.splitTextToSize(orden.falla, pageWidth - (margin * 2));
    doc.text(splitFalla, margin, currentY);

    currentY += (splitFalla.length * 5) + 5;

    if (orden.accesorios) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(colorDark);
        doc.text("Accesorios Recibidos:", margin, currentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(50);
        const splitAccesorios = doc.splitTextToSize(orden.accesorios, pageWidth - (margin * 2) - 40);
        doc.text(splitAccesorios, margin + 40, currentY);
        currentY += (splitAccesorios.length * 5) + 5;
    }
    currentY += 10;

    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colorGray);
    doc.text("FECHA ESTIMADA DE ENTREGA", margin, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(colorDark);
    const fechaEst = new Date(orden.fecha_estimada_de_fin).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }) || "Pendiente";
    doc.text(fechaEst, margin, currentY + 6);

    const totalBoxWidth = 80;
    const totalBoxX = pageWidth - margin - totalBoxWidth;
    const totalBoxY = currentY - 5;

    doc.setFillColor(colorDark);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, 25, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("TOTAL ESTIMADO", totalBoxX + 5, totalBoxY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(colorWhite);
    doc.text(`$${orden.costo_total}`, totalBoxX + totalBoxWidth - 5, totalBoxY + 18, { align: "right" });

    const footerY = pageHeight - 45;

    const canvas = document.createElement("canvas");
    JsBarcode(canvas, orden.id_orden.toString(), {
        format: "CODE128",
        displayValue: true,
        fontSize: 16,
        lineColor: colorDark,
        width: 3,
        height: 50,
        background: "#ffffff"
    });
    const barcodeDataUrl = canvas.toDataURL("image/png");
    doc.addImage(barcodeDataUrl, "PNG", (pageWidth / 2) - 40, footerY, 80, 30);

    doc.setFontSize(8);
    doc.setTextColor(colorGray);
    doc.text("SGST - Sistema de Gestión de Servicios Técnicos", pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("Comprobante generado digitalmente.", pageWidth / 2, pageHeight - 6, { align: "center" });

    return doc.output("blob");
};
