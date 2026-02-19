-- ============================================
-- SGST
-- MySQL 8+
-- ============================================

DROP DATABASE IF EXISTS sgst;
CREATE DATABASE sgst CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sgst;

-- =========================
-- Catálogos
-- =========================
CREATE TABLE cat_prioridades (
  id_prioridad TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  orden_int INT DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO cat_prioridades (clave, descripcion, orden_int)
VALUES ('baja','Baja',10),('normal','Normal',20),('alta','Alta',30),('urgente','Urgente',40);

CREATE TABLE cat_estados (
  id_estado TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  orden_int INT DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO cat_estados (clave, descripcion, orden_int)
VALUES ('recibido','Recibido',10),('en_reparacion','En reparación',20),('finalizado','Finalizado',30),('listo_para_entregar','Listo para entregar',40),('cancelado','Cancelado',50);

-- =========================
-- LICENCIAS (UUIDs fijos para referenciar desde frontend)
-- =========================
CREATE TABLE licencias (
  id_licencia CHAR(36) PRIMARY KEY,
  nombre_licencia VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  precio_mensual DECIMAL(10,2) NOT NULL,
  precio_anual DECIMAL(10,2) NOT NULL,
  max_talleres INT DEFAULT 1,      -- 0 = ilimitado
  max_usuarios INT DEFAULT 5,      -- 0 = ilimitado
  activo TINYINT DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO licencias (id_licencia, nombre_licencia, descripcion, precio_mensual, precio_anual, max_talleres, max_usuarios)
VALUES
('96e832d8-928d-4bb3-ab05-fbbeadf6b881', 'Normal', 'Hasta 1 taller y 5 usuarios', 499, 4999, 1, 5),
('92931b2d-cb2e-4b68-a854-06434468683a', 'Pro', 'Hasta 2 talleres y 10 usuarios por taller', 899, 8999, 2, 10),
('7512bf7a-729b-4e93-8fed-64bdf95d8e74', 'Empresarial', 'Ilimitado', 1499, 14999, 0, 0);

-- =========================
-- USUARIOS Y EMPRESAS (dependencia circular: se crean con FK desactivada)
-- =========================
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE usuarios (
  id_usuario CHAR(36) PRIMARY KEY,
  id_empresa CHAR(36) NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  apellidos_usuario VARCHAR(150),
  correo_usuario VARCHAR(150),
  telefono_usuario VARCHAR(20),
  hash_password VARCHAR(255) NOT NULL,
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_sesion TIMESTAMP NULL,
  CONSTRAINT fk_usuarios_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE empresas (
  id_empresa CHAR(36) PRIMARY KEY,
  id_creador CHAR(36) NOT NULL,
  nombre_empresa VARCHAR(150) NOT NULL,
  rfc_empresa VARCHAR(20),
  telefono_empresa VARCHAR(20),
  correo_empresa VARCHAR(150),
  direccion_empresa VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT DEFAULT 1,
  UNIQUE (nombre_empresa),
  CONSTRAINT fk_empresas_creador FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- SUSCRIPCIONES
-- =========================
CREATE TABLE suscripciones (
  id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa CHAR(36) NOT NULL,
  id_licencia CHAR(36) NOT NULL,
  fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
  fecha_fin DATE NULL,
  activa TINYINT DEFAULT 1,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE,
  FOREIGN KEY (id_licencia) REFERENCES licencias(id_licencia) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================
-- TALLERES (PK UUID)
-- =========================
CREATE TABLE talleres (
  id_taller CHAR(36) PRIMARY KEY,
  id_empresa CHAR(36) NOT NULL,
  nombre_taller VARCHAR(150) NOT NULL,
  telefono_taller VARCHAR(20),
  correo_taller VARCHAR(150),
  direccion_taller VARCHAR(255),
  rfc_taller VARCHAR(20),
  ruta_logo VARCHAR(255),
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_empresa, nombre_taller),
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla para administrar permisos especiales por taller
CREATE TABLE usuarios_talleres (
  id_usuario_taller INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario CHAR(36) NOT NULL,
  id_taller CHAR(36) NOT NULL,
  rol_taller ENUM('ADMIN', 'TECNICO', 'RECEPCIONISTA') NOT NULL,
  activo TINYINT DEFAULT 1,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE CASCADE,
  UNIQUE (id_usuario, id_taller)
) ENGINE=InnoDB;

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  nombre_cliente VARCHAR(100) NOT NULL,
  apellidos_cliente VARCHAR(100) NOT NULL,
  correo_cliente VARCHAR(150),
  telefono_cliente VARCHAR(20),
  direccion_cliente VARCHAR(255),
  notas_cliente TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  UNIQUE (id_taller, correo_cliente),
  UNIQUE (id_taller, telefono_cliente),
  INDEX idx_clientes_taller_nombre (id_taller, nombre_cliente)
) ENGINE=InnoDB;

-- =========================
-- TIPOS DE EQUIPOS
-- =========================
CREATE TABLE tipo_equipos (
  id_tipo INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  nombre_tipo VARCHAR(100) NOT NULL,
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  UNIQUE (id_taller, nombre_tipo)
) ENGINE=InnoDB;

-- =========================
-- EQUIPOS
-- =========================
CREATE TABLE equipos (
  id_equipo INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  id_tipo INT NOT NULL,
  num_serie VARCHAR(100) NOT NULL,
  marca_equipo VARCHAR(100),
  modelo_equipo VARCHAR(100),
  descripcion_equipo TEXT,
  activo TINYINT DEFAULT 1,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_tipo) REFERENCES tipo_equipos(id_tipo) ON DELETE RESTRICT,
  UNIQUE (id_taller, num_serie),
  INDEX idx_equipos_taller_tipo (id_taller, id_tipo)
) ENGINE=InnoDB;

-- =========================
-- ORDENES DE SERVICIO
-- =========================
CREATE TABLE ordenes (
  id_orden INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  num_orden INT NOT NULL,
  id_cliente INT NOT NULL,
  id_equipo INT NOT NULL,
  accesorios TEXT,
  falla TEXT,
  diagnostico_inicial TEXT,
  solucion_aplicada TEXT,
  id_prioridad TINYINT UNSIGNED NOT NULL DEFAULT 2, -- referencia cat_prioridades
  tecnico_asignado CHAR(36) NULL,
  fecha_estimada_de_fin DATE NULL,
  fecha_entrega DATE NULL, -- AL MOMENTO DE YA ENTREGAR LA ORDEN
  id_estado TINYINT UNSIGNED NOT NULL DEFAULT 1, -- referencia cat_estados
  costo_total DECIMAL(12,2) DEFAULT 0.00,
  meses_garantia INT NOT NULL DEFAULT 0,
  fecha_fin_garantia DATE NULL,
  es_por_garantia TINYINT DEFAULT 0,
  id_orden_origen INT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  creado_por CHAR(36) NULL, -- SE COLOCA EN EL ENDPOINT
  cerrado_por CHAR(36) NULL, -- SE COLOCA EN EL ENDPOINT
  visible TINYINT DEFAULT 1,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE RESTRICT,
  FOREIGN KEY (tecnico_asignado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (cerrado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_prioridad) REFERENCES cat_prioridades(id_prioridad) ON DELETE RESTRICT,
  FOREIGN KEY (id_estado) REFERENCES cat_estados(id_estado) ON DELETE RESTRICT,
  FOREIGN KEY (id_orden_origen) REFERENCES ordenes(id_orden) ON DELETE SET NULL,
  UNIQUE (id_taller, num_orden),
  INDEX idx_ordenes_taller (id_taller),
  INDEX idx_ordenes_taller_estado (id_taller, id_estado),
  INDEX idx_ordenes_taller_fecha_creacion (id_taller, fecha_creacion),
  INDEX idx_ordenes_cliente (id_cliente),
  INDEX idx_ordenes_fecha_creacion (fecha_creacion),
  INDEX idx_ordenes_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB;

-- =========================
-- PAGOS
-- =========================
CREATE TABLE pagos (
  id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_taller CHAR(36) NOT NULL,
  tipo_pago VARCHAR(50) NOT NULL, -- flexible: 'anticipo','abono','liquidacion','otros' u otros
  monto DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(100),
  referencia VARCHAR(150),
  comentario_pago TEXT,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por CHAR(36) NULL,
  anulado TINYINT DEFAULT 0,
  motivo_anulacion TEXT NULL,
  fecha_anulacion TIMESTAMP NULL,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  INDEX idx_pagos_orden (id_orden),
  INDEX idx_pagos_fecha (fecha_pago)
) ENGINE=InnoDB;

-- =========================
-- HISTORIAL DE ORDENES
-- =========================
CREATE TABLE orden_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  accion VARCHAR(150) NOT NULL,
  detalle TEXT,
  id_usuario CHAR(36) NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_historial_orden (id_orden),
  INDEX idx_historial_fecha (fecha)
) ENGINE=InnoDB;

-- =========================
-- ARCHIVOS ADJUNTOS
-- =========================
CREATE TABLE archivos (
  id_archivo INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  ruta_archivo VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(50),
  descripcion TEXT,
  subido_por CHAR(36) NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT DEFAULT 1,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE RESTRICT,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_archivos_orden (id_orden),
  INDEX idx_archivos_tipo (tipo_archivo)
) ENGINE=InnoDB;

-- =========================
-- NOTIFICACIONES
-- =========================
CREATE TABLE notificaciones (
	id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario CHAR(36) NULL,
    mensaje TEXT,
    leido TINYINT DEFAULT 0,
    direccion_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_leido TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- TOKENS
-- =========================

CREATE TABLE refresh_tokens (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expira_en DATETIME NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valido TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- EXTENSIÓN: CAMPOS DE GARANTÍA EN ORDENES (SGST) Y TABLA ORDENES_GARANTIAS
-- ============================================

CREATE TABLE IF NOT EXISTS ordenes_garantias (
  id_garantia INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_orden_origen INT NULL,
  fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT,
  monto_cubierto DECIMAL(12,2) DEFAULT 0.00,
  cubre_total TINYINT DEFAULT 1,
  activo TINYINT DEFAULT 1,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE RESTRICT,
  FOREIGN KEY (id_orden_origen) REFERENCES ordenes(id_orden) ON DELETE SET NULL,
  INDEX idx_ordenes_garantias_orden (id_orden),
  INDEX idx_ordenes_garantias_orden_origen (id_orden_origen)
) ENGINE=InnoDB;

-- ============================================
-- MÓDULOS ADICIONALES DEL SISTEMA
-- ============================================

-- =========================
-- CATÁLOGOS ADICIONALES
-- =========================

CREATE TABLE cat_categorias_refacciones (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  activo TINYINT DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO cat_categorias_refacciones (clave, descripcion)
VALUES 
('pantallas', 'Pantallas y Displays'),
('discos', 'Discos SSD/HDD'),
('memoria', 'Memoria RAM'),
('teclados', 'Teclados'),
('ratones', 'Ratones'),
('cargadores', 'Cargadores y Fuentes'),
('baterias', 'Baterías'),
('camaras', 'Cámaras'),
('puertos', 'Puertos y Conectores'),
('otros', 'Otros');

CREATE TABLE cat_metodos_pago (
  id_metodo INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  activo TINYINT DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO cat_metodos_pago (clave, descripcion)
VALUES 
('efectivo', 'Efectivo'),
('tarjeta_debito', 'Tarjeta de Débito'),
('tarjeta_credito', 'Tarjeta de Crédito'),
('transferencia', 'Transferencia Bancaria'),
('cheque', 'Cheque'),
('otros', 'Otros');

-- =========================
-- PROVEEDORES
-- =========================

CREATE TABLE proveedores (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  nombre_proveedor VARCHAR(150) NOT NULL,
  contacto VARCHAR(150),
  telefono VARCHAR(20),
  correo VARCHAR(150),
  direccion VARCHAR(255),
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  UNIQUE (id_taller, nombre_proveedor),
  INDEX idx_proveedores_taller (id_taller)
) ENGINE=InnoDB;

-- =========================
-- REFACCIONES (INVENTARIO DE REPARACIÓN)
-- =========================

CREATE TABLE refacciones (
  id_refaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  id_categoria INT NOT NULL,
  nombre_refaccion VARCHAR(150) NOT NULL,
  codigo_barras VARCHAR(100),
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_categoria) REFERENCES cat_categorias_refacciones(id_categoria) ON DELETE RESTRICT,
  UNIQUE (id_taller, codigo_barras),
  INDEX idx_refacciones_taller_categoria (id_taller, id_categoria),
  INDEX idx_refacciones_taller_nombre (id_taller, nombre_refaccion),
  INDEX idx_refacciones_taller_stock (id_taller, stock_actual)
) ENGINE=InnoDB;

-- =========================
-- PRODUCTOS PARA VENTA DIRECTA
-- =========================

CREATE TABLE productos_venta (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  id_categoria INT NOT NULL,
  nombre_producto VARCHAR(150) NOT NULL,
  codigo_barras VARCHAR(100),
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  precio_venta DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  precio_compra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_categoria) REFERENCES cat_categorias_refacciones(id_categoria) ON DELETE RESTRICT,
  UNIQUE (id_taller, codigo_barras),
  INDEX idx_productos_venta_taller_categoria (id_taller, id_categoria),
  INDEX idx_productos_venta_taller_nombre (id_taller, nombre_producto),
  INDEX idx_productos_venta_taller_stock (id_taller, stock_actual)
) ENGINE=InnoDB;

-- =========================
-- COMPRAS
-- =========================

CREATE TABLE compras (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  num_factura VARCHAR(100),
  id_proveedor INT NULL,
  proveedor VARCHAR(150),
  fecha_compra DATE NOT NULL DEFAULT (CURRENT_DATE),
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado ENUM('pendiente', 'confirmada', 'anulada') NOT NULL DEFAULT 'pendiente',
  creado_por CHAR(36) NULL,
  confirmado_por CHAR(36) NULL,
  fecha_confirmacion TIMESTAMP NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (confirmado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_compras_taller_fecha (id_taller, fecha_compra),
  INDEX idx_compras_taller_estado (id_taller, estado)
) ENGINE=InnoDB;

CREATE TABLE compras_detalle (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT NOT NULL,
  tipo_item ENUM('refaccion', 'producto_venta') NOT NULL,
  id_refaccion INT NULL,
  id_producto_venta INT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_compra) REFERENCES compras(id_compra) ON DELETE CASCADE,
  FOREIGN KEY (id_refaccion) REFERENCES refacciones(id_refaccion) ON DELETE RESTRICT,
  FOREIGN KEY (id_producto_venta) REFERENCES productos_venta(id_producto) ON DELETE RESTRICT,
  INDEX idx_compras_detalle_compra (id_compra)
) ENGINE=InnoDB;

-- =========================
-- VENTAS
-- =========================

CREATE TABLE ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  num_venta INT NOT NULL,
  id_cliente INT NULL,
  fecha_venta DATE NOT NULL DEFAULT (CURRENT_DATE),
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  id_metodo_pago INT NULL,
  metodo_pago VARCHAR(50),
  creado_por CHAR(36) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  FOREIGN KEY (id_metodo_pago) REFERENCES cat_metodos_pago(id_metodo) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  UNIQUE (id_taller, num_venta),
  INDEX idx_ventas_taller_fecha (id_taller, fecha_venta),
  INDEX idx_ventas_taller_cliente (id_taller, id_cliente)
) ENGINE=InnoDB;

CREATE TABLE ventas_detalle (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto_venta INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
  FOREIGN KEY (id_producto_venta) REFERENCES productos_venta(id_producto) ON DELETE RESTRICT,
  INDEX idx_ventas_detalle_venta (id_venta)
) ENGINE=InnoDB;

-- =========================
-- REFACCIONES UTILIZADAS EN ÓRDENES
-- =========================

CREATE TABLE ordenes_refacciones (
  id_orden_refaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_refaccion INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  fecha_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE RESTRICT,
  FOREIGN KEY (id_refaccion) REFERENCES refacciones(id_refaccion) ON DELETE RESTRICT,
  INDEX idx_ordenes_refacciones_orden (id_orden),
  INDEX idx_ordenes_refacciones_refaccion (id_refaccion)
) ENGINE=InnoDB;

-- =========================
-- IMÁGENES DE RECEPCIÓN DE EQUIPOS
-- =========================

CREATE TABLE ordenes_imagenes_recepcion (
  id_imagen INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  ruta_imagen VARCHAR(255) NOT NULL,
  orden_imagen TINYINT NOT NULL CHECK (orden_imagen BETWEEN 1 AND 3),
  subido_por CHAR(36) NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden) ON DELETE CASCADE,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  UNIQUE (id_orden, orden_imagen),
  INDEX idx_ordenes_imagenes_orden (id_orden)
) ENGINE=InnoDB;

-- =========================
-- FINANZAS - MOVIMIENTOS
-- =========================

CREATE TABLE finanzas_movimientos (
  id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  tipo_movimiento ENUM('ingreso', 'egreso') NOT NULL,
  categoria ENUM('compra', 'venta', 'pago_orden', 'gasto', 'ingreso_otro') NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_movimiento DATE NOT NULL DEFAULT (CURRENT_DATE),
  id_relacionado INT NULL,
  tipo_relacionado VARCHAR(50),
  creado_por CHAR(36) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_finanzas_taller_fecha (id_taller, fecha_movimiento),
  INDEX idx_finanzas_taller_tipo (id_taller, tipo_movimiento),
  INDEX idx_finanzas_taller_categoria (id_taller, categoria),
  INDEX idx_finanzas_taller_fecha_tipo (id_taller, fecha_movimiento, tipo_movimiento)
) ENGINE=InnoDB;

-- =========================
-- GASTOS OPERATIVOS
-- =========================

CREATE TABLE gastos (
  id_gasto INT AUTO_INCREMENT PRIMARY KEY,
  id_taller CHAR(36) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_gasto DATE NOT NULL DEFAULT (CURRENT_DATE),
  ruta_comprobante VARCHAR(255),
  creado_por CHAR(36) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE RESTRICT,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_gastos_taller_fecha (id_taller, fecha_gasto)
) ENGINE=InnoDB;

-- =========================
-- HISTORIAL DE PRECIOS DE REFACCIONES
-- =========================

CREATE TABLE refacciones_precios_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_refaccion INT NOT NULL,
  precio_anterior DECIMAL(12,2) NOT NULL,
  precio_nuevo DECIMAL(12,2) NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cambiado_por CHAR(36) NULL,
  FOREIGN KEY (id_refaccion) REFERENCES refacciones(id_refaccion) ON DELETE CASCADE,
  FOREIGN KEY (cambiado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_refacciones_precios_historial_refaccion (id_refaccion),
  INDEX idx_refacciones_precios_historial_fecha (fecha_cambio)
) ENGINE=InnoDB;

-- ============================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- ============================================
-- Nota: Los triggers se crean sin DELIMITER para compatibilidad con ejecución directa
-- Si se ejecuta desde línea de comandos MySQL/MariaDB, se debe usar DELIMITER $$

-- Trigger: Validar máximo 3 imágenes por orden
CREATE TRIGGER trg_validar_max_imagenes_recepcion
BEFORE INSERT ON ordenes_imagenes_recepcion
FOR EACH ROW
BEGIN
  DECLARE imagen_count INT;
  SELECT COUNT(*) INTO imagen_count
  FROM ordenes_imagenes_recepcion
  WHERE id_orden = NEW.id_orden;
  
  IF imagen_count >= 3 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Máximo 3 imágenes permitidas por orden';
  END IF;
END;

-- Trigger: Actualizar stock al confirmar compra de refacciones
CREATE TRIGGER trg_actualizar_stock_refacciones_compra
AFTER INSERT ON compras_detalle
FOR EACH ROW
BEGIN
  IF NEW.tipo_item = 'refaccion' AND NEW.id_refaccion IS NOT NULL THEN
    UPDATE refacciones
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id_refaccion = NEW.id_refaccion;
  END IF;
END;

-- Trigger: Actualizar stock al confirmar compra de productos venta
CREATE TRIGGER trg_actualizar_stock_productos_compra
AFTER INSERT ON compras_detalle
FOR EACH ROW
BEGIN
  IF NEW.tipo_item = 'producto_venta' AND NEW.id_producto_venta IS NOT NULL THEN
    UPDATE productos_venta
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id_producto = NEW.id_producto_venta;
  END IF;
END;

-- Trigger: Reducir stock al usar refacción en orden
CREATE TRIGGER trg_reducir_stock_refacciones_orden
AFTER INSERT ON ordenes_refacciones
FOR EACH ROW
BEGIN
  UPDATE refacciones
  SET stock_actual = stock_actual - NEW.cantidad
  WHERE id_refaccion = NEW.id_refaccion;
END;

-- Trigger: Reducir stock al realizar venta
CREATE TRIGGER trg_reducir_stock_venta
AFTER INSERT ON ventas_detalle
FOR EACH ROW
BEGIN
  UPDATE productos_venta
  SET stock_actual = stock_actual - NEW.cantidad
  WHERE id_producto = NEW.id_producto_venta;
END;

-- Trigger: Registrar movimiento financiero al confirmar compra
CREATE TRIGGER trg_finanzas_compra_confirmada
AFTER UPDATE ON compras
FOR EACH ROW
BEGIN
  IF NEW.estado = 'confirmada' AND (OLD.estado IS NULL OR OLD.estado != 'confirmada') THEN
    INSERT INTO finanzas_movimientos (
      id_taller, tipo_movimiento, categoria, concepto, monto, 
      fecha_movimiento, id_relacionado, tipo_relacionado, creado_por
    ) VALUES (
      NEW.id_taller, 'egreso', 'compra', 
      CONCAT('Compra #', NEW.id_compra, IFNULL(CONCAT(' - ', NEW.proveedor), '')),
      NEW.total, NEW.fecha_compra, NEW.id_compra, 'compra', NEW.confirmado_por
    );
  END IF;
END;

-- Trigger: Registrar movimiento financiero al realizar venta
CREATE TRIGGER trg_finanzas_venta
AFTER INSERT ON ventas
FOR EACH ROW
BEGIN
  INSERT INTO finanzas_movimientos (
    id_taller, tipo_movimiento, categoria, concepto, monto,
    fecha_movimiento, id_relacionado, tipo_relacionado, creado_por
  ) VALUES (
    NEW.id_taller, 'ingreso', 'venta',
    CONCAT('Venta #', NEW.num_venta),
    NEW.total, NEW.fecha_venta, NEW.id_venta, 'venta', NEW.creado_por
  );
END;

-- Trigger: Registrar movimiento financiero al registrar pago de orden
CREATE TRIGGER trg_finanzas_pago_orden
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
  IF NEW.anulado = 0 THEN
    INSERT INTO finanzas_movimientos (
      id_taller, tipo_movimiento, categoria, concepto, monto,
      fecha_movimiento, id_relacionado, tipo_relacionado, creado_por
    ) VALUES (
      NEW.id_taller, 'ingreso', 'pago_orden',
      CONCAT('Pago orden #', (SELECT num_orden FROM ordenes WHERE id_orden = NEW.id_orden)),
      NEW.monto, DATE(NEW.fecha_pago), NEW.id_pago, 'pago', NEW.creado_por
    );
  END IF;
END;

-- Trigger: Registrar movimiento financiero al anular pago
CREATE TRIGGER trg_finanzas_pago_anulado
AFTER UPDATE ON pagos
FOR EACH ROW
BEGIN
  IF NEW.anulado = 1 AND OLD.anulado = 0 THEN
    INSERT INTO finanzas_movimientos (
      id_taller, tipo_movimiento, categoria, concepto, monto,
      fecha_movimiento, id_relacionado, tipo_relacionado, creado_por
    ) VALUES (
      NEW.id_taller, 'egreso', 'pago_orden',
      CONCAT('Anulación pago orden #', (SELECT num_orden FROM ordenes WHERE id_orden = NEW.id_orden)),
      -NEW.monto, DATE(NEW.fecha_anulacion), NEW.id_pago, 'pago_anulado', NEW.creado_por
    );
  END IF;
END;

-- Trigger: Registrar movimiento financiero al crear gasto
CREATE TRIGGER trg_finanzas_gasto
AFTER INSERT ON gastos
FOR EACH ROW
BEGIN
  INSERT INTO finanzas_movimientos (
    id_taller, tipo_movimiento, categoria, concepto, monto,
    fecha_movimiento, id_relacionado, tipo_relacionado, creado_por
  ) VALUES (
    NEW.id_taller, 'egreso', 'gasto', NEW.concepto,
    NEW.monto, NEW.fecha_gasto, NEW.id_gasto, 'gasto', NEW.creado_por
  );
END;

-- Trigger: Registrar historial de cambios de precio en refacciones
CREATE TRIGGER trg_historial_precio_refaccion
AFTER UPDATE ON refacciones
FOR EACH ROW
BEGIN
  IF NEW.precio_unitario != OLD.precio_unitario THEN
    INSERT INTO refacciones_precios_historial (
      id_refaccion, precio_anterior, precio_nuevo, cambiado_por
    ) VALUES (
      NEW.id_refaccion, OLD.precio_unitario, NEW.precio_unitario, NULL
    );
  END IF;
END;
