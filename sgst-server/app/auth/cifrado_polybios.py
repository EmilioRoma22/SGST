def cifrar_mensaje_polybios(mensaje):
    matriz_polibio = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I/J', 'K'],
        ['L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U'],
        ['V', 'W', 'X', 'Y', 'Z']
    ]

    mapeo_coordenadas = {}
    
    for fila in range(5):
        for col in range(5):
            coordenada = str(fila + 1) + str(col + 1)

            if matriz_polibio[fila][col] == 'I/J':
                mapeo_coordenadas['I'] = coordenada
                mapeo_coordenadas['J'] = coordenada
            else:
                mapeo_coordenadas[matriz_polibio[fila][col]] = coordenada

    mensaje = mensaje.upper().replace(" ", "").replace("Ñ", "N")

    texto_cifrado = ""
    
    for letra in mensaje:
        if letra in mapeo_coordenadas:
            coordenada = mapeo_coordenadas[letra]
            texto_cifrado += coordenada
        else:
            texto_cifrado += letra
            
    return texto_cifrado

def descifrar_mensaje_polybios(cifrado):
    matriz_polibio = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I/J', 'K'],
        ['L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U'],
        ['V', 'W', 'X', 'Y', 'Z']
    ]

    texto_descifrado = ""
    i = 0
    
    while i < len(cifrado):
        
        if i + 1 < len(cifrado):
            
            coord_fila_str = cifrado[i]
            coord_col_str = cifrado[i+1]
            
            try:
                fila = int(coord_fila_str) - 1
                col = int(coord_col_str) - 1
                
                letra_o_grupo = matriz_polibio[fila][col]
                
                if letra_o_grupo == 'I/J':
                    texto_descifrado += 'I'
                else:
                    texto_descifrado += letra_o_grupo
                
                i += 2
                
            except (ValueError, IndexError):
                print(f"Error: Coordenada no válida o formato incorrecto en la posición {i}: {cifrado[i:i+2]}")
                texto_descifrado += cifrado[i]
                i += 1

        else:
            texto_descifrado += cifrado[i]
            i += 1
            
    return texto_descifrado