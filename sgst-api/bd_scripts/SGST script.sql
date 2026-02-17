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
  descripcion VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO cat_estados (clave, descripcion)
VALUES ('recibido','Recibido'),('en_reparacion','En reparación'),('finalizado','Finalizado'),('listo_para_entregar','Listo para entregar'),('cancelado','Cancelado');
-- =========================
-- EMPRESAS
-- =========================
CREATE TABLE empresas (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  id_creador INT NOT NULL,
  nombre_empresa VARCHAR(150) NOT NULL,
  rfc_empresa VARCHAR(20),
  telefono_empresa VARCHAR(20),
  correo_empresa VARCHAR(150),
  direccion_empresa VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT DEFAULT 1,
  UNIQUE (nombre_empresa)
) ENGINE=InnoDB;

-- =========================
-- LICENCIAS
-- =========================
CREATE TABLE licencias (
  id_licencia INT AUTO_INCREMENT PRIMARY KEY,
  nombre_licencia VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  precio_mensual DECIMAL(10,2) NOT NULL,
  precio_anual DECIMAL(10,2) NOT NULL,
  max_talleres INT DEFAULT 1,      -- 0 = ilimitado
  max_usuarios INT DEFAULT 5,      -- 0 = ilimitado
  activo TINYINT DEFAULT 1
);

INSERT INTO licencias (nombre_licencia, descripcion, precio_mensual, precio_anual, max_talleres, max_usuarios)
VALUES
('Normal', 'Hasta 1 taller y 5 usuarios', 499, 4999, 1, 5),
('Pro', 'Hasta 2 talleres y 10 usuarios por taller', 899, 8999, 2, 10),
('Empresarial', 'Ilimitado', 1499, 14999, 0, 0);

-- =========================
-- SUSCRIPCIONES
-- =========================
CREATE TABLE suscripciones (
  id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  id_licencia INT NOT NULL,
  fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
  fecha_fin DATE NULL,
  activa TINYINT DEFAULT 1,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE,
  FOREIGN KEY (id_licencia) REFERENCES licencias(id_licencia) ON DELETE RESTRICT
);

-- =========================
-- TALLERES
-- =========================
CREATE TABLE talleres (
  id_taller INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
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
);

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  apellidos_usuario VARCHAR(150),
  correo_usuario VARCHAR(150),
  telefono_usuario VARCHAR(20),
  hash_password VARCHAR(255) NOT NULL,
  activo TINYINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_sesion TIMESTAMP NULL,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

ALTER TABLE empresas ADD FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario);

-- Tabla para administrar permisos especiales por taller
CREATE TABLE usuarios_talleres (
  id_usuario_taller INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_taller INT NOT NULL,
  rol_taller ENUM('ADMIN', 'TECNICO', 'RECEPCIONISTA') NOT NULL,
  activo TINYINT DEFAULT 1,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_taller) REFERENCES talleres(id_taller) ON DELETE CASCADE,
  UNIQUE (id_usuario, id_taller)
);

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  id_taller INT NOT NULL,
  nombre_cliente VARCHAR(100) NOT NULL,
  apellidos_cliente VARCHAR(100) NOT NULL,
  correo_cliente VARCHAR(150),
  telefono_cliente VARCHAR(20),
  direccion_cliente VARCHAR(255),
  notas_cliente TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL,
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
  id_taller INT NOT NULL,
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
  id_taller INT NOT NULL,
  id_tipo INT NOT NULL,
  num_serie VARCHAR(100) NOT NULL,
  marca_equipo VARCHAR(100),
  modelo_equipo VARCHAR(100),
  descripcion_equipo TEXT,
  activo TINYINT DEFAULT 1,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NULL,
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
  id_taller INT NOT NULL,
  num_orden INT NOT NULL,
  id_cliente INT NOT NULL,
  id_equipo INT NOT NULL,
  accesorios TEXT,
  falla TEXT,
  diagnostico_inicial TEXT,
  solucion_aplicada TEXT,
  id_prioridad TINYINT UNSIGNED NOT NULL DEFAULT 2, -- referencia cat_prioridades
  tecnico_asignado INT NULL,
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
  creado_por INT NULL, -- SE COLOCA EN EL ENDPOINT
  cerrado_por INT NULL, -- SE COLOCA EN EL ENDPOINT
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
  id_taller INT NOT NULL,
  tipo_pago VARCHAR(50) NOT NULL, -- flexible: 'anticipo','abono','liquidacion','otros' u otros
  monto DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(100),
  referencia VARCHAR(150),
  comentario_pago TEXT,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INT NULL,
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
  id_usuario INT NULL,
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
  subido_por INT NULL,
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
    id_usuario INT,
    mensaje TEXT,
    leido TINYINT DEFAULT 0,
    direccion_url VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_leido TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =========================
-- TOKENS
-- =========================

CREATE TABLE refresh_tokens (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expira_en DATETIME NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valido TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- ============================================
-- EXTENSIÓN: CAMPOS DE GARANTÍA EN ORDENES (SGST) Y TABLA ORDENES_GARANTIAS
-- ============================================

ALTER TABLE ordenes
  ADD CONSTRAINT fk_ordenes_origen_sgst
    FOREIGN KEY (id_orden_origen) REFERENCES ordenes(id_orden);

CREATE TABLE IF NOT EXISTS ordenes_garantias (
  id_garantia INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT NOT NULL,
  id_orden_origen INT NULL,
  fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT,
  monto_cubierto DECIMAL(12,2) DEFAULT 0.00,
  cubre_total TINYINT DEFAULT 1,
  activo TINYINT DEFAULT 1,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden),
  FOREIGN KEY (id_orden_origen) REFERENCES ordenes(id_orden)
);
