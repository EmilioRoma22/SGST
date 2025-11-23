SELECT
    o.id_orden,
    o.id_taller,
    o.num_orden,
    o.accesorios,
    o.falla,
    o.diagnostico_inicial,
    o.solucion_aplicada,
    o.fecha_estimada_de_fin,
    o.fecha_entrega,
    o.costo_total,
    o.meses_garantia,
    o.fecha_fin_garantia,
    o.es_por_garantia,
    o.fecha_creacion,
    o.ultima_actualizacion,
    o.creado_por,
    o.cerrado_por,
    -- Cliente
    c.id_cliente,
    c.nombre_cliente,
    c.apellidos_cliente,
    -- Equipo
    e.id_equipo,
    e.id_tipo,
    e.marca_equipo,
    e.modelo_equipo,
    te.nombre_tipo,
    -- Prioridad
    cp.id_prioridad,
    cp.descripcion AS descripcion_prioridad,
    -- Técnico asignado
    u.id_usuario AS id_tecnico,
    u.nombre_usuario AS nombre_tecnico,
    u.apellidos_usuario AS apellidos_tecnico,
    -- Estado
    ce.id_estado,
    ce.descripcion AS descripcion_estado
FROM ordenes o
LEFT JOIN talleres t ON t.id_taller = o.id_taller
LEFT JOIN clientes c ON c.id_cliente = o.id_cliente
LEFT JOIN equipos e ON e.id_equipo = o.id_equipo
LEFT JOIN tipo_equipos te ON te.id_tipo = e.id_tipo
LEFT JOIN usuarios u ON u.id_usuario = o.tecnico_asignado
LEFT JOIN cat_prioridades cp ON cp.id_prioridad = o.id_prioridad
LEFT JOIN cat_estados ce ON ce.id_estado = o.id_estado
WHERE o.id_taller = 1
ORDER BY o.fecha_creacion DESC;